import * as ort from 'onnxruntime-web/wasm'
import { DEFAULT_CONFIDENCE, LABELS, type DetectionOptions } from '@/lib/detection-config'

export type Detection = {
  classId: number
  label: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

export type DetectionResult = {
  detections: Detection[]
  durationMs: number
  confidenceThreshold: number
  passes: number
}

export type ModelProgress = {
  stage: 'loading' | 'initializing' | 'detecting'
  percent?: number
  pass?: number
  totalPasses?: number
}

const INPUT_SIZE = 640
const IOU_THRESHOLD = 0.45
const MAX_DETECTIONS = 300

type Region = { x: number; y: number; width: number; height: number }

let sessionPromise: Promise<ort.InferenceSession> | null = null

async function loadModel(onProgress: (progress: ModelProgress) => void) {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      ort.env.wasm.numThreads = 1
      ort.env.wasm.wasmPaths = {
        wasm: new URL('/onnx/ort-wasm-simd-threaded.wasm', window.location.origin).href,
        mjs: new URL('/onnx/ort-wasm-simd-threaded.mjs', window.location.origin).href,
      }
      onProgress({ stage: 'loading', percent: 0 })
      const response = await fetch('/models/yolov8n.onnx', {
        signal: AbortSignal.timeout(120_000),
      })
      if (!response.ok) throw new Error('The YOLO model could not be loaded. Please check your connection and try again.')

      const total = Number(response.headers.get('content-length'))
      const reader = response.body?.getReader()
      let model: Uint8Array

      if (reader) {
        const chunks: Uint8Array[] = []
        let received = 0
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          received += value.length
          onProgress({ stage: 'loading', percent: total > 0 ? Math.min(100, Math.round(received / total * 100)) : undefined })
        }
        model = new Uint8Array(received)
        let offset = 0
        for (const chunk of chunks) {
          model.set(chunk, offset)
          offset += chunk.length
        }
      } else {
        model = new Uint8Array(await response.arrayBuffer())
      }

      onProgress({ stage: 'initializing' })
      return ort.InferenceSession.create(model, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
    })().catch((error) => {
      sessionPromise = null
      throw error
    })
  }
  return sessionPromise
}

function prepareImage(image: HTMLImageElement, region: Region) {
  const canvas = document.createElement('canvas')
  canvas.width = INPUT_SIZE
  canvas.height = INPUT_SIZE
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Your browser does not support image processing.')

  const scale = Math.min(INPUT_SIZE / region.width, INPUT_SIZE / region.height)
  const width = Math.max(1, Math.round(region.width * scale))
  const height = Math.max(1, Math.round(region.height * scale))
  const padX = Math.floor((INPUT_SIZE - width) / 2)
  const padY = Math.floor((INPUT_SIZE - height) / 2)

  // Letterboxing preserves proportions; 114 is the padding value used by Ultralytics.
  context.fillStyle = 'rgb(114, 114, 114)'
  context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE)
  context.drawImage(image, region.x, region.y, region.width, region.height, padX, padY, width, height)
  const pixels = context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data
  const plane = INPUT_SIZE * INPUT_SIZE
  const input = new Float32Array(3 * plane)
  for (let i = 0; i < plane; i++) {
    input[i] = pixels[i * 4] / 255
    input[plane + i] = pixels[i * 4 + 1] / 255
    input[2 * plane + i] = pixels[i * 4 + 2] / 255
  }
  return {
    tensor: new ort.Tensor('float32', input, [1, 3, INPUT_SIZE, INPUT_SIZE]),
    padX,
    padY,
    scaleX: width / region.width,
    scaleY: height / region.height,
  }
}

function intersectionOverUnion(a: Detection, b: Detection) {
  const intersectionWidth = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  const intersectionHeight = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  const intersection = intersectionWidth * intersectionHeight
  const union = a.width * a.height + b.width * b.height - intersection
  return union > 0 ? intersection / union : 0
}

export async function detectObjects(
  image: HTMLImageElement,
  onProgress: (progress: ModelProgress) => void,
  options: DetectionOptions = { confidence: DEFAULT_CONFIDENCE, enhanced: true },
): Promise<DetectionResult> {
  const threshold = Math.min(0.9, Math.max(0.1, Number.isFinite(options.confidence) ? options.confidence : DEFAULT_CONFIDENCE))
  const session = await loadModel(onProgress)
  const start = performance.now()
  const regions: Region[] = [{ x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }]
  if (options.enhanced) {
    const width = Math.ceil(image.naturalWidth * 0.65)
    const height = Math.ceil(image.naturalHeight * 0.65)
    for (const y of [0, image.naturalHeight - height]) {
      for (const x of [0, image.naturalWidth - width]) {
        regions.push({ x, y, width, height })
      }
    }
  }

  const candidates: Detection[] = []
  for (const [index, region] of regions.entries()) {
    onProgress({ stage: 'detecting', pass: index + 1, totalPasses: regions.length, percent: Math.round(index / regions.length * 100) })
    // Let React paint the processing state before single-threaded WASM starts.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    const prepared = prepareImage(image, region)
    let output: ort.InferenceSession.ReturnType | undefined
    try {
      output = await session.run({ [session.inputNames[0]]: prepared.tensor })
      const tensor = output[session.outputNames[0]]
      if (tensor.dims.length !== 3 || tensor.dims[1] !== LABELS.length + 4) {
        throw new Error('The model returned an unsupported output format.')
      }
      const data = tensor.data as Float32Array
      const count = tensor.dims[2]
      for (let i = 0; i < count; i++) {
        let confidence = 0
        let classId = 0
        for (let c = 0; c < LABELS.length; c++) {
          const score = data[(c + 4) * count + i]
          if (score > confidence) {
            confidence = score
            classId = c
          }
        }
        if (confidence < threshold) continue
        const centerX = data[i]
        const centerY = data[count + i]
        const width = data[2 * count + i]
        const height = data[3 * count + i]
        const left = (centerX - width / 2 - prepared.padX) / prepared.scaleX
        const top = (centerY - height / 2 - prepared.padY) / prepared.scaleY
        const rightEdge = (centerX + width / 2 - prepared.padX) / prepared.scaleX
        const bottomEdge = (centerY + height / 2 - prepared.padY) / prepared.scaleY
        // Keep the full-image prediction for objects cut off at internal tile edges.
        if (index > 0 && (
          (region.x > 0 && left < 3) || (region.y > 0 && top < 3) ||
          (region.x + region.width < image.naturalWidth && rightEdge > region.width - 3) ||
          (region.y + region.height < image.naturalHeight && bottomEdge > region.height - 3)
        )) continue
        const x = region.x + Math.max(0, left)
        const y = region.y + Math.max(0, top)
        const right = region.x + Math.min(region.width, rightEdge)
        const bottom = region.y + Math.min(region.height, bottomEdge)
        if (![x, y, right, bottom, confidence].every(Number.isFinite) || right <= x || bottom <= y) continue
        candidates.push({ classId, label: LABELS[classId], confidence, x, y, width: right - x, height: bottom - y })
      }
    } finally {
      prepared.tensor.dispose()
      if (output) Object.values(output).forEach((tensor) => tensor.dispose())
    }
  }

  // Merge all passes with class-aware NMS to avoid counting overlapping predictions twice.
  candidates.sort((a, b) => b.confidence - a.confidence)
  const detections: Detection[] = []
  for (const candidate of candidates) {
    if (detections.some((kept) => kept.classId === candidate.classId && intersectionOverUnion(kept, candidate) > IOU_THRESHOLD)) continue
    detections.push(candidate)
    if (detections.length === MAX_DETECTIONS) break
  }
  return { detections, durationMs: performance.now() - start, confidenceThreshold: threshold, passes: regions.length }
}
