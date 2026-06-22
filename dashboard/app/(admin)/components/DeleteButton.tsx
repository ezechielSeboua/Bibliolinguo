'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteButton({
  action,
  confirm: confirmMsg = 'Supprimer ? Cette action est irréversible.',
  successMessage = 'Supprimé.',
}: {
  action: () => Promise<void>
  label?: string
  confirm?: string
  successMessage?: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (!window.confirm(confirmMsg)) return
        startTransition(async () => {
          try {
            await action()
            toast.success(successMessage)
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Une erreur est survenue.')
          }
        })
      }}
      disabled={isPending}
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
      title="Supprimer"
    >
      {isPending
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Trash2 className="h-4 w-4" />
      }
    </button>
  )
}
