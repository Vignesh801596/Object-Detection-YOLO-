import { CircleCheck, Focus, ListFilter, LoaderCircle, ScanLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import type { DetectionResult } from '@/lib/yolo'

export function DetectionResults({ result, busy, hasImage, threshold }: { result: DetectionResult | null; busy: boolean; hasImage: boolean; threshold: number }) {
  const confidencePercent = Math.round((result?.confidenceThreshold ?? threshold) * 100)
  const total = result?.detections.length
  const classes = result ? new Set(result.detections.map((detection) => detection.classId)).size : null

  return (
    <section aria-labelledby="results-title" aria-busy={busy} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <h2 id="results-title" className="flex items-center gap-2.5 text-sm font-semibold"><ListFilter className="size-4 text-muted-foreground" aria-hidden="true" />Detection results</h2>
        <Badge variant={result ? 'secondary' : 'outline'}>{result ? 'Complete' : busy ? 'Processing' : 'Waiting'}</Badge>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4 px-5 py-5">
        <div>
          <p className="text-[11px] text-muted-foreground">Objects detected</p>
          <p className="mt-2 font-mono text-[31px] leading-none tracking-[-2px]" aria-live="polite">{total ?? '—'}</p>
        </div>
        <div className="border-l border-border pl-5">
          <p className="text-[11px] text-muted-foreground">Unique classes</p>
          <p className="mt-2 font-mono text-[31px] leading-none tracking-[-2px]">{classes ?? '—'}</p>
        </div>
      </div>
      <Separator />

      {result && result.detections.length > 0 ? (
        <div className="flex min-h-60 flex-1 flex-col">
          <div className="flex justify-between px-5 pt-4 pb-2 font-mono text-[9px] tracking-wider text-muted-foreground"><span>OBJECT</span><span>CONFIDENCE</span></div>
          <ol className="max-h-[270px] overflow-y-auto px-5 pb-4" aria-label="Detected objects">
            {result.detections.map((detection, index) => (
              <li key={`${detection.classId}-${index}`} className="flex items-center gap-3 border-b border-border/70 py-3 last:border-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-[10px] text-secondary-foreground">{String(index + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-xs font-medium capitalize">{detection.label}</span>
                <span className="font-mono text-xs text-primary">{(detection.confidence * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <Empty className="min-h-60 px-7 py-9">
          <EmptyHeader>
            <EmptyMedia><span className="results-focus"><Focus className="size-7" strokeWidth={1.25} aria-hidden="true" /></span></EmptyMedia>
            <EmptyTitle>{busy ? 'Taking a closer look' : result ? 'No objects found' : 'A fresh perspective awaits'}</EmptyTitle>
            <EmptyDescription>
              {busy ? 'The model is preparing your results. Your image stays right here.' : result ? `No supported objects met the ${confidencePercent}% confidence threshold. Try lowering confidence, enabling Enhanced scan, or using a clearer photo. Check the supported categories below.` : hasImage ? 'Your image is ready. Click Detect Objects to see what YOLO finds.' : 'Upload an image and run detection. Your discoveries will appear here.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="mt-auto border-t border-border bg-muted/40 px-5 py-3.5">
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><ScanLine className="size-3" aria-hidden="true" />Confidence threshold</span>
          <span className="font-mono">≥ {confidencePercent}%</span>
        </div>
        {result && <p className="mt-2 flex items-center gap-1.5 text-[10px] text-primary"><CircleCheck className="size-3" aria-hidden="true" />{result.passes} {result.passes === 1 ? 'scan' : 'scans'} completed in {(result.durationMs / 1000).toFixed(2)}s</p>}
        {busy && <p className="mt-2 flex items-center gap-1.5 text-[10px] text-primary"><LoaderCircle className="size-3 animate-spin" aria-hidden="true" />Running locally on your device</p>}
      </div>
    </section>
  )
}
