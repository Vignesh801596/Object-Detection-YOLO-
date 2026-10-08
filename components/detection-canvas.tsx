'use client'

import { useEffect, useRef } from 'react'
import type { Detection } from '@/lib/yolo'

export function DetectionCanvas({ image, detections }: { image: HTMLImageElement; detections: Detection[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const frame = canvas?.parentElement
    if (!canvas || !context || !frame) return

    function draw() {
      if (!canvas || !context || !frame) return
      const fit = Math.min(1, (frame.clientWidth - 16) / image.naturalWidth, (frame.clientHeight - 16) / image.naturalHeight)
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const displayWidth = Math.max(1, Math.floor(image.naturalWidth * fit))
      const displayHeight = Math.max(1, Math.floor(image.naturalHeight * fit))
      canvas.width = Math.round(displayWidth * pixelRatio)
      canvas.height = Math.round(displayHeight * pixelRatio)
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      const scaleX = canvas.width / image.naturalWidth
      const scaleY = canvas.height / image.naturalHeight
      const fontSize = 11 * pixelRatio
      const padding = 4 * pixelRatio
      context.font = `600 ${fontSize}px Arial, sans-serif`
      context.textBaseline = 'top'
      context.lineWidth = 1.5 * pixelRatio

      for (const detection of detections) {
        const x = detection.x * scaleX
        const y = detection.y * scaleY
        context.strokeStyle = '#c4f582'
        context.strokeRect(x, y, detection.width * scaleX, detection.height * scaleY)
        const label = `${detection.label} ${Math.round(detection.confidence * 100)}%`
        const labelWidth = Math.min(canvas.width, context.measureText(label).width + padding * 2)
        const labelHeight = fontSize + padding * 2
        const labelX = Math.max(0, Math.min(x, canvas.width - labelWidth))
        const labelY = y >= labelHeight ? y - labelHeight : Math.min(y, Math.max(0, canvas.height - labelHeight))
        context.fillStyle = '#c4f582'
        context.fillRect(labelX, labelY, labelWidth, labelHeight)
        context.fillStyle = '#17231c'
        context.fillText(label, labelX + padding, labelY + padding, Math.max(1, labelWidth - padding * 2))
      }
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [image, detections])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Uploaded image${detections.length ? ` with ${detections.length} detected objects. Object names and confidence scores are listed in the detection results.` : '. No detection boxes yet.'}`}
      className="block max-h-full max-w-full object-contain"
    />
  )
}
