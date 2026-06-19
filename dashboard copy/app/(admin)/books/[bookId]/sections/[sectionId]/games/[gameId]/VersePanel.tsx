'use client'

import { useState, useTransition } from 'react'

type Verse = { verse_number: number; text: string }

export default function VersePanel({ books }: { books: { id: string; name: string }[] }) {
  const [bookId, setBookId] = useState('')
  const [chapter, setChapter] = useState('')
  const [verses, setVerses] = useState<Verse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function load() {
    if (!bookId || !chapter) return
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/verses?bookId=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(chapter)}`)
      if (!res.ok) {
        setError('Impossible de charger les versets.')
        setVerses([])
        return
      }
      const data = await res.json()
      if (!data.length) {
        setError('Aucun verset trouvé pour ce chapitre.')
        setVerses([])
      } else {
        setVerses(data)
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Versets bibliques</h3>

      <div className="space-y-2 mb-3">
        <select
          value={bookId}
          onChange={(e) => { setBookId(e.target.value); setVerses([]) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Choisir un livre —</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            value={chapter}
            onChange={(e) => { setChapter(e.target.value); setVerses([]) }}
            placeholder="Chapitre"
            min="1"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={load}
            disabled={isPending || !bookId || !chapter}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {isPending ? '…' : 'OK'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {verses.length > 0 && (
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {verses.map((v) => (
            <p key={v.verse_number} className="text-xs text-gray-700 leading-relaxed">
              <span className="font-bold text-blue-700 mr-1">{v.verse_number}</span>
              {v.text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
