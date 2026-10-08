'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LABELS } from '@/lib/detection-config'

export function SupportedObjects() {
  const [search, setSearch] = useState('')
  const matches = LABELS.filter((label) => label.includes(search.trim().toLowerCase()))
  return (
    <details className="mt-5 rounded-xl border border-border bg-card px-5 py-4 sm:px-6">
      <summary className="cursor-pointer text-sm font-medium marker:text-primary">What can Yolo Vision detect? <span className="ml-2 font-normal text-muted-foreground">80 supported categories</span></summary>
      <div className="mt-4 flex flex-col gap-4">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">All 80 categories are always enabled. This pretrained model cannot recognize everything: objects outside these categories need a differently trained model. Small, blurry, hidden, or unusual objects can still be missed.</p>
        <Field className="max-w-sm">
          <FieldLabel htmlFor="category-search">Find an object category</FieldLabel>
          <Input id="category-search" type="search" placeholder="Try dog, phone, or bicycle…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Field>
        <p className="sr-only" role="status">{matches.length} matching categories</p>
        <div className="flex flex-wrap gap-2">
          {matches.map((label) => <Badge key={label} variant="secondary">{label}</Badge>)}
        </div>
        {matches.length === 0 && <p className="text-sm text-muted-foreground">No matching category. Try a broader name, or check the full list by clearing your search. Changing confidence cannot add new categories.</p>}
      </div>
    </details>
  )
}
