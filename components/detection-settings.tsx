'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import type { DetectionOptions } from '@/lib/detection-config'

export function DetectionSettings({ options, onChange, disabled }: {
  options: DetectionOptions
  onChange: (options: DetectionOptions) => void
  disabled: boolean
}) {
  return (
    <FieldSet disabled={disabled} className="border-t border-border px-5 py-5">
      <FieldLegend variant="label" className="sr-only">Detection settings</FieldLegend>
      <FieldGroup className="gap-5 sm:flex-row sm:gap-8">
        <Field data-disabled={disabled} className="sm:flex-1">
          <FieldLabel id="confidence-label" htmlFor="confidence">Minimum confidence <span className="ml-auto font-mono">{Math.round(options.confidence * 100)}%</span></FieldLabel>
          <Slider id="confidence" aria-labelledby="confidence-label" aria-describedby="confidence-help" min={10} max={90} step={5} value={[Math.round(options.confidence * 100)]} disabled={disabled} onValueChange={(value) => onChange({ ...options, confidence: (Array.isArray(value) ? value[0] : value) / 100 })} className="my-2" />
          <FieldDescription id="confidence-help">Lower values may find more objects, but also more false positives.</FieldDescription>
        </Field>
        <Field orientation="horizontal" data-disabled={disabled} className="sm:flex-1">
          <Checkbox id="enhanced-scan" checked={options.enhanced} disabled={disabled} onCheckedChange={(checked) => onChange({ ...options, enhanced: checked })} aria-describedby="enhanced-help" />
          <FieldContent>
            <FieldLabel htmlFor="enhanced-scan">Enhanced scan</FieldLabel>
            <FieldDescription id="enhanced-help">Adds 4 overlapping close-ups to help find smaller objects. Takes longer.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
