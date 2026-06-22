'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateSectionForm({
  createSection,
}: {
  createSection: (formData: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createSection(formData)
        formRef.current?.reset()
        setOpen(false)
        toast.success('Section créée avec succès.')
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erreur inconnue'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Nouvelle section
      </button>
    )
  }

  return (
    <div className="mt-4 bg-white border border-indigo-200 rounded-xl p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Nouvelle section</h3>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
          <input
            name="title"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            placeholder="Ex : La Création du monde"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chapitre début</label>
            <input
              name="chapter_start"
              type="number"
              min="1"
              required
              defaultValue="1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chapitre fin</label>
            <input
              name="chapter_end"
              type="number"
              min="1"
              required
              defaultValue="1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? 'Création…' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null) }}
            className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
