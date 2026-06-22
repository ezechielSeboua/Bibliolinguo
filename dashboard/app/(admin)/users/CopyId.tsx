'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const short = `${id.slice(0, 8)}…`

  return (
    <button
      onClick={handleCopy}
      title={id}
      className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors font-mono text-xs"
    >
      {short}
      {copied
        ? <Check className="h-3 w-3 text-emerald-500" />
        : <Copy className="h-3 w-3" />
      }
    </button>
  )
}
