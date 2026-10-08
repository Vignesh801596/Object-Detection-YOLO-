'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowRight, Check, ChevronRight, FileImage, ImagePlus, LoaderCircle, LockKeyhole, RotateCcw, ScanLine, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { DetectionCanvas } from '@/components/detection-canvas'
import { DetectionResults } from '@/components/detection-results'
import { DetectionSettings } from '@/components/detection-settings'
import { DEFAULT_CONFIDENCE, type DetectionOptions } from '@/lib/detection-config'
import { cn } from '@/lib/utils'
import type { DetectionResult, ModelProgress } from '@/lib/yolo'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const NO_DETECTIONS: DetectionResult['detections'] = []
type UploadedImage = { name: string; size: number; image: HTMLImageElement }
type Phase = 'idle' | 'reading' | 'ready' | 'loading' | 'initializing' | 'detecting' | 'done'

export function ObjectDetector() {
  const [upload, setUpload] = useState<UploadedImage | null>(null)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [percent, setPercent] = useState<number | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [options, setOptions] = useState<DetectionOptions>({ confidence: DEFAULT_CONFIDENCE, enhanced: true })
  const [scan, setScan] = useState({ pass: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const operationRef = useRef(0)
  const lockedRef = useRef(false)
  const busy = ['reading', 'loading', 'initializing', 'detecting'].includes(phase)

  useEffect(() => () => {
    operationRef.current++
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  async function selectFile(file?: File) {
    if (!file || lockedRef.current) return
    setError(null)
    const supported = ['image/jpeg', 'image/png', 'image/webp']
    if ((!supported.includes(file.type) && (file.type !== '' || !/\.(jpe?g|png|webp)$/i.test(file.name))) || file.size === 0) {
      setError('Please choose a valid JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('This image is a little too large. Please choose a file smaller than 10 MB.')
      return
    }

    const operation = ++operationRef.current
    const url = URL.createObjectURL(file)
    lockedRef.current = true
    setPhase('reading')
    try {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = url
      await image.decode()
      if (image.naturalWidth * image.naturalHeight > 40_000_000 || Math.max(image.naturalWidth, image.naturalHeight) > 16000) {
        throw new Error('Please resize this image to under 40 megapixels and 16,000 pixels per side.')
      }
      if (operation !== operationRef.current) {
        URL.revokeObjectURL(url)
        return
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = url
      setUpload({ name: file.name, size: file.size, image })
      setResult(null)
      setPhase('ready')
    } catch (cause) {
      URL.revokeObjectURL(url)
      if (operation !== operationRef.current) return
      setError(cause instanceof Error && cause.message.startsWith('Please resize') ? cause.message : 'This file could not be read as an image. Please try another JPG, PNG, or WebP.')
      setPhase(upload ? (result ? 'done' : 'ready') : 'idle')
    } finally {
      lockedRef.current = false
    }
  }

  async function runDetection() {
    if (!upload || lockedRef.current) return
    const operation = ++operationRef.current
    lockedRef.current = true
    setError(null)
    setResult(null)
    setPercent(undefined)
    setScan({ pass: 0, total: 0 })
    setPhase(modelLoaded ? 'detecting' : 'loading')
    try {
      const { detectObjects } = await import('@/lib/yolo')
      const detected = await detectObjects(upload.image, (progress: ModelProgress) => {
        if (operation !== operationRef.current) return
        setPhase(progress.stage)
        setPercent(progress.percent)
        if (progress.stage === 'detecting') {
          setModelLoaded(true)
          setScan({ pass: progress.pass ?? 1, total: progress.totalPasses ?? 1 })
        }
      }, options)
      if (operation !== operationRef.current) return
      setResult(detected)
      setPhase('done')
    } catch (cause) {
      if (operation !== operationRef.current) return
      const message = cause instanceof Error ? cause.message : ''
      setError(message.includes('could not be loaded') ? message : 'Detection could not finish. Please try again, or use an up-to-date Chrome, Edge, Firefox, or Safari browser with WebAssembly enabled.')
      setPhase('ready')
    } finally {
      lockedRef.current = false
    }
  }

  function clear() {
    if (lockedRef.current) return
    operationRef.current++
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    if (inputRef.current) inputRef.current.value = ''
    setUpload(null)
    setResult(null)
    setError(null)
    setDragging(false)
    setPercent(undefined)
    setPhase('idle')
  }

  const status = phase === 'reading' ? 'Reading your image…' : phase === 'loading' ? `Loading YOLO model${percent !== undefined ? ` · ${percent}%` : '…'}` : phase === 'initializing' ? 'Preparing the detection engine…' : phase === 'detecting' ? `Detecting objects…${scan.total ? ` · Scan ${scan.pass} of ${scan.total}` : ''}` : ''
  const activeStep = result ? 2 : upload ? 1 : 0

  return (
    <div>
      <ol aria-label="Detection steps" className="mb-5 flex items-center gap-3 text-[11px] sm:gap-5 sm:text-xs">
        {['Upload an image', 'Run detection', 'Explore results'].map((label, index) => (
          <li key={label} className="flex items-center gap-3 sm:gap-5" aria-current={index === activeStep ? 'step' : undefined}>
            {index > 0 && <ChevronRight className="size-3 text-muted-foreground/50" aria-hidden="true" />}
            <div className={cn('flex items-center gap-2', index > activeStep && 'text-muted-foreground')}>
              <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[9px]', index <= activeStep ? 'border-primary/20 bg-secondary text-primary' : 'border-border bg-card text-muted-foreground')}>
                {index < activeStep ? <Check className="size-3" aria-hidden="true" /> : `0${index + 1}`}
              </span>
              <span className={cn(index === activeStep && 'font-medium')}>{label}</span>
            </div>
          </li>
        ))}
      </ol>

      {error && <Alert variant="destructive" className="mb-4"><AlertCircle /><AlertTitle>Let&apos;s try that again</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section aria-labelledby="workspace-title" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex h-16 items-center justify-between gap-3 px-5">
            <h2 id="workspace-title" className="flex items-center gap-2.5 text-sm font-semibold"><FileImage className="size-4 text-muted-foreground" aria-hidden="true" />Image workspace</h2>
            <Badge variant="outline">{result ? 'Detection complete' : upload ? 'Image ready' : 'No image selected'}</Badge>
          </div>
          <Separator />
          <div className="p-3.5 sm:p-4">
            <input
              id="image-upload"
              ref={inputRef}
              type="file"
              tabIndex={-1}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Upload an image"
              disabled={busy}
              onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void selectFile(file) }}
            />
            <div
              className={cn('image-stage relative flex h-[330px] items-center justify-center overflow-hidden rounded-lg sm:h-[380px]', dragging && 'is-dragging')}
              onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true) }}
              onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }}
              onDrop={(event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files.length > 1) { setError('Please drop one image at a time.'); return }; void selectFile(event.dataTransfer.files[0]) }}
            >
              {upload ? (
                <div className="flex size-full items-center justify-center p-2">
                  <DetectionCanvas image={upload.image} detections={result?.detections ?? NO_DETECTIONS} />
                </div>
              ) : (
                <div className="flex flex-col items-center px-5 text-center">
                  <div className="upload-symbol mb-6" aria-hidden="true">
                    <span className="corner corner-tl" /><span className="corner corner-tr" /><span className="corner corner-bl" /><span className="corner corner-br" />
                    <ImagePlus className="size-8 text-stage-accent" strokeWidth={1.3} />
                  </div>
                  <h3 className="text-[17px] font-medium tracking-tight text-stage-foreground">Every image has a story.</h3>
                  <p className="mt-2 text-xs text-stage-muted">Drop your image here, and discover what&apos;s in it.</p>
                  <Button variant="upload" size="lg" className="mt-6 h-10 gap-2 px-5" onClick={() => inputRef.current?.click()} disabled={busy}>
                    <Upload data-icon="inline-start" />Choose an image<ArrowRight data-icon="inline-end" />
                  </Button>
                  <p className="mt-3.5 font-mono text-[9px] tracking-wide text-stage-muted">JPG, PNG, WEBP <span className="mx-1.5">/</span> MAX 10 MB</p>
                </div>
              )}
              <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 font-mono text-[8px] tracking-[0.1em] text-stage-muted"><span className="size-1 rounded-full bg-stage-accent" />{result ? 'PREDICTION OUTPUT' : upload ? 'SOURCE IMAGE' : 'INPUT CANVAS'}</span>
              <span className="pointer-events-none absolute right-3 bottom-3 font-mono text-[8px] tracking-wider text-stage-muted">{upload ? `${upload.image.naturalWidth} × ${upload.image.naturalHeight}` : 'READY FOR YOUR PERSPECTIVE'}</span>
              {dragging && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-stage/95 text-sm font-medium text-stage-accent"><Upload className="mr-2 size-5" />Drop to load your image</div>}
            </div>

            <div className="mt-3.5 flex min-h-5 items-center justify-between gap-2 px-0.5 text-[10px] text-muted-foreground">
              <span className="flex min-w-0 items-center gap-1.5">
                {upload ? <><FileImage className="size-3 shrink-0" /><span className="truncate">{upload.name}</span><span className="shrink-0 font-mono text-[9px]">{(upload.size / 1024 / 1024).toFixed(2)} MB</span></> : <><LockKeyhole className="size-3 shrink-0" />Private by design. Nothing is uploaded to a server.</>}
              </span>
              {upload && <Button variant="link" size="xs" onClick={() => inputRef.current?.click()} disabled={busy}>Replace image</Button>}
            </div>
          </div>
          <DetectionSettings options={options} disabled={busy} onChange={(next) => {
            setOptions(next)
            setResult(null)
            if (upload) setPhase('ready')
          }} />
          <Separator />
          <div className="flex min-h-[78px] flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Button size="lg" className="h-10 gap-2 px-5" onClick={runDetection} disabled={!upload || busy}>
                {busy ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <ScanLine data-icon="inline-start" />}
                {busy ? 'Processing…' : 'Detect Objects'}
              </Button>
              <Button variant="ghost" size="lg" className="h-10" onClick={clear} disabled={busy || (!upload && !error)}><RotateCcw data-icon="inline-start" />Clear</Button>
            </div>
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={cn('size-1.5 rounded-full', modelLoaded ? 'bg-primary' : 'bg-muted-foreground/40')} />{modelLoaded ? 'YOLOv8n loaded' : 'Powered by YOLOv8n'}</p>
          </div>
          {busy && <div className="border-t border-border bg-secondary/40 px-5 py-3" role="status" aria-live="polite"><p className="text-xs text-primary">{status}</p>{phase === 'loading' && percent !== undefined && <Progress aria-label="YOLO model download" value={percent} className="mt-2" />}{phase === 'loading' && <p className="mt-1 text-[10px] text-muted-foreground">First use downloads the model and runtime. Following detections reuse the model.</p>}</div>}
        </section>
        <DetectionResults result={result} busy={busy} hasImage={Boolean(upload)} threshold={options.confidence} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{result ? `Detection complete. ${result.detections.length} objects found.` : ''}</p>
    </div>
  )
}
