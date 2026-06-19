'use client'

import { useState, useTransition, useRef } from 'react'

export default function EditGameForm({
  gameId,
  initialTitle,
  initialDifficulty,
  initialXp,
  updateGame,
}: {
  gameId: string
  initialTitle: string
  initialDifficulty: number
  initialXp: number
  updateGame: (formData: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await updateGame(formData)
        setOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Modifier
      </button>
    )
  }

  return (
    <div className="mt-3 bg-white border border-blue-200 rounded-xl p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Modifier le jeu</h3>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Titre</label>
          <input
            name="title"
            required
            defaultValue={initialTitle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Difficulté</label>
            <select
              name="difficulty"
              defaultValue={String(initialDifficulty)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 – Facile</option>
              <option value="2">2 – Moyen</option>
              <option value="3">3 – Difficile</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">XP</label>
            <input
              name="xp_reward"
              type="number"
              defaultValue={initialXp}
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null) }}
            className="px-3 py-1.5 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
