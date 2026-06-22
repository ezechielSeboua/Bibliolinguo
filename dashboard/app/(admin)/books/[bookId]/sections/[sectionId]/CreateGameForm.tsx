'use client'

import { useState, useTransition, useRef } from 'react'
import { toast } from 'sonner'

export default function CreateGameForm({
  createGame,
}: {
  createGame: (formData: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createGame(formData)
        formRef.current?.reset()
        setOpen(false)
        toast.success('Jeu créé avec succès.')
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
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Nouveau jeu
      </button>
    )
  }

  return (
    <div className="mt-4 bg-white border border-blue-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Nouveau jeu</h3>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            name="title"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex : Les Origines – QCM"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mcq">QCM</option>
              <option value="fill_verse">Compléter le verset</option>
              <option value="order">Remettre dans l&apos;ordre</option>
              <option value="match">Association</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
            <select
              name="difficulty"
              defaultValue="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 – Facile</option>
              <option value="2">2 – Moyen</option>
              <option value="3">3 – Difficile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">XP</label>
            <input
              name="xp_reward"
              type="number"
              defaultValue="10"
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Création…' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null) }}
            className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
