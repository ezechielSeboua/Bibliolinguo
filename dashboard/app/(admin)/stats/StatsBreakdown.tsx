'use client'

import { motion } from 'framer-motion'

type Item = { label: string; count: number; bg: string }

export default function StatsBreakdown({ breakdown, total }: { breakdown: Item[]; total: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-sm shadow-sm">
      {breakdown.map(({ label, count, bg }, i) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={label} className="px-4 py-3 border-b border-slate-100 last:border-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${bg}`} />
                <span className="text-sm text-slate-700">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{count}</span>
                <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
