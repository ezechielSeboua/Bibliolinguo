'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/cn'

const STATUS_STYLES: Record<string, string> = {
  draft:     'text-slate-600  bg-slate-100  border-slate-200',
  review:    'text-amber-700  bg-amber-50   border-amber-200',
  published: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

export default function GameStatusSelect({
  currentStatus,
  updateStatus,
}: {
  currentStatus: string
  updateStatus: (status: string) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const s = e.target.value
        startTransition(async () => { await updateStatus(s) })
      }}
      className={cn(
        'text-xs font-medium border rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 cursor-pointer transition-colors',
        STATUS_STYLES[currentStatus] ?? STATUS_STYLES.draft,
      )}
    >
      <option value="draft">Brouillon</option>
      <option value="review">À relire</option>
      <option value="published">Publié</option>
    </select>
  )
}
