import { ArrowUpRight, Cpu, Focus, LockKeyhole, ScanLine } from 'lucide-react'
import { ObjectDetector } from '@/components/object-detector'
import { SupportedObjects } from '@/components/supported-objects'
import { Badge } from '@/components/ui/badge'

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <a href="/" aria-label="Yolo Vision home" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Focus className="size-6" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="text-[21px] font-semibold tracking-[-1px]">Yolo Vision<span className="text-primary">.</span></span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] tracking-[0.12em] text-muted-foreground sm:block">AI / ML INTERNSHIP</span>
            <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
              <span className="size-1.5 rounded-full bg-primary" />
              Computer vision
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-10 sm:px-8 sm:pt-14">
        <section aria-labelledby="page-title" className="mb-9">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.15em] text-primary sm:text-[11px]">
            <span className="h-px w-5 bg-primary" />
            A NEW WAY TO SEE
          </div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 id="page-title" className="text-[36px] leading-[1.15] font-medium tracking-[-1.7px] sm:text-[52px] sm:tracking-[-2.5px]">
                Object Detection <span className="text-primary">(YOLO)</span>
              </h1>
              <p className="mt-4 max-w-[600px] text-sm leading-6 text-muted-foreground sm:text-[15px]">
                Turn pixels into possibilities. Upload an image and let YOLO identify<br className="hidden sm:block" />
                {' '}the objects within it—with real predictions, right in your browser.
              </p>
            </div>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="size-3.5 text-primary" aria-hidden="true" />
              Your images stay on your device
            </div>
          </div>
        </section>

        <ObjectDetector />
        <SupportedObjects />

        <section aria-labelledby="about-yolo" className="mt-7 grid gap-5 rounded-xl border border-border bg-card/60 px-5 py-5 sm:px-6 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
              <ScanLine className="size-4 text-primary" aria-hidden="true" />
            </span>
            <div>
              <h2 id="about-yolo" className="text-xs font-semibold">One look. Multiple discoveries.</h2>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                YOLO stands for <span className="font-medium text-foreground">You Only Look Once</span>. It finds and classifies objects in a single pass through a neural network.
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-7">
            <div><dt className="mb-1.5 font-mono text-[9px] tracking-wider text-muted-foreground">MODEL</dt><dd className="text-xs font-medium">YOLOv8 Nano</dd></div>
            <div><dt className="mb-1.5 font-mono text-[9px] tracking-wider text-muted-foreground">TRAINED ON</dt><dd className="text-xs font-medium">COCO · 80 classes</dd></div>
            <div><dt className="mb-1.5 font-mono text-[9px] tracking-wider text-muted-foreground">RUNTIME</dt><dd className="flex items-center gap-1.5 text-xs font-medium"><Cpu className="size-3.5" aria-hidden="true" />On-device</dd></div>
          </dl>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-[1200px] flex-col justify-between gap-3 px-5 pb-7 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:px-8">
        <p>Built to explore. Designed to learn. <span className="mx-1.5 text-border">/</span> Yolo Vision Internship Project</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="https://docs.ultralytics.com/models/yolov8/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 transition-colors hover:text-primary">Ultralytics YOLO <ArrowUpRight className="size-3" aria-hidden="true" /></a>
          <span className="text-border">·</span>
          <a href="https://onnxruntime.ai/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">ONNX Runtime</a>
          <span className="text-border">·</span>
          <a href="/models/LICENSE.txt" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">Model: AGPL-3.0</a>
        </div>
      </footer>
    </div>
  )
}
