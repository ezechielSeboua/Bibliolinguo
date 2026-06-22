'use client'

import { useState, useTransition } from 'react'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingRow({
  settingKey,
  label,
  description,
  currentValue,
  upsertSetting,
}: {
  settingKey: string
  label: string
  description: string
  currentValue: string
  upsertSetting: (key: string, value: string) => Promise<void>
}) {
  const [value, setValue] = useState(currentValue)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await upsertSetting(settingKey, value)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        toast.success(`"${label}" sauvegardé.`)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erreur'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
        />
        <button
          onClick={handleSave}
          disabled={isPending || value === currentValue}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : saved
            ? <><Check className="h-3.5 w-3.5" /> Sauvegardé</>
            : 'Sauvegarder'
          }
        </button>
      </div>
    </div>
  )
}
