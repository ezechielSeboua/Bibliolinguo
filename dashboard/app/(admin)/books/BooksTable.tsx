'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ChevronRight } from 'lucide-react'

type Book = {
  id: string
  name: string
  position: number
  is_published: boolean
  chapter_count: number
  book_groups: { name: string } | null
  sectionCount: number
}

export default function BooksTable({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('')
  const [testament, setTestament] = useState<string>('all')
  const router = useRouter()

  const filtered = books.filter((b) => {
    const matchQuery = b.name.toLowerCase().includes(query.toLowerCase())
    const matchTestament =
      testament === 'all' || (b.book_groups?.name ?? '') === testament
    return matchQuery && matchTestament
  })

  const testaments = Array.from(new Set(books.map((b) => b.book_groups?.name ?? ''))).filter(Boolean)

  return (
    <div>
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative group flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un livre…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Effacer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {['all', ...testaments].map((t) => (
            <button
              key={t}
              onClick={() => setTestament(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                testament === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'all' ? 'Tous' : t}
            </button>
          ))}
        </div>

        {(query || testament !== 'all') && (
          <span className="text-xs text-slate-500">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 w-10">#</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Livre</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Testament</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Chapitres</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Sections</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Statut</th>
              <th className="w-8 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                  Aucun livre ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              filtered.map((book) => (
                <tr
                  key={book.id}
                  onClick={() => router.push(`/books/${book.id}`)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">{book.position}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {book.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{book.book_groups?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-slate-600 tabular-nums">{book.chapter_count}</td>
                  <td className="px-4 py-3 text-center text-slate-600 tabular-nums">{book.sectionCount}</td>
                  <td className="px-4 py-3 text-center">
                    {book.is_published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
