'use client'

import { useState, useTransition, useRef } from 'react'

// ── Type-specific field components ────────────────────────────────────────────

function McqFields() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Saisissez les options et cochez la bonne réponse.</p>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="answer_index"
            value={String(i)}
            required={i === 0}
            className="accent-blue-600 flex-shrink-0"
          />
          <input
            name={`option_${i}`}
            placeholder={`Option ${String.fromCharCode(65 + i)}${i < 2 ? ' (requise)' : ''}`}
            required={i < 2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  )
}

function FillVerseFields() {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Texte avant le trou
        </label>
        <input
          name="text_before"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Au commencement, Dieu créa…"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Texte après le trou <span className="text-gray-400">(optionnel)</span>
        </label>
        <input
          name="text_after"
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="…et la terre."
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Options de réponse — cochez la bonne.</p>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="answer_index"
              value={String(i)}
              required={i === 0}
              className="accent-blue-600 flex-shrink-0"
            />
            <input
              name={`option_${i}`}
              placeholder={`Option ${String.fromCharCode(65 + i)}${i < 2 ? ' (requise)' : ''}`}
              required={i < 2}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderFields() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        Entrez les éléments dans le bon ordre. Le joueur devra les remettre dans cet ordre.
      </p>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {i + 1}
          </span>
          <input
            name={`item_${i}`}
            placeholder={`Élément ${i + 1}${i < 2 ? ' (requis)' : ''}`}
            required={i < 2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  )
}

function MatchFields() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Entrez les paires à associer (minimum 2).</p>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            name={`pair_left_${i}`}
            placeholder={`Gauche ${i + 1}${i < 2 ? ' (requise)' : ''}`}
            required={i < 2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 flex-shrink-0">↔</span>
          <input
            name={`pair_right_${i}`}
            placeholder={`Droite ${i + 1}${i < 2 ? ' (requise)' : ''}`}
            required={i < 2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function QuestionForm({
  gameType,
  createQuestion,
}: {
  gameType: string
  createQuestion: (formData: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createQuestion(formData)
        formRef.current?.reset()
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
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Ajouter une question
      </button>
    )
  }

  return (
    <div className="mt-4 bg-white border border-blue-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">Nouvelle question</h3>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Prompt <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              name="prompt"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quelle est la bonne réponse ?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Référence biblique <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              name="reference"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gn 1:1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Difficulté</label>
          <select
            name="difficulty"
            defaultValue="1"
            className="w-40 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 – Facile</option>
            <option value="2">2 – Moyen</option>
            <option value="3">3 – Difficile</option>
          </select>
        </div>

        <div className="border-t border-gray-100 pt-4">
          {gameType === 'mcq' && <McqFields />}
          {gameType === 'fill_verse' && <FillVerseFields />}
          {gameType === 'order' && <OrderFields />}
          {gameType === 'match' && <MatchFields />}
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
            {isPending ? 'Ajout…' : 'Ajouter'}
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
