import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'

type BookRow = {
  id: string
  name: string
  position: number
  is_published: boolean
  chapter_count: number
  book_groups: { name: string } | null
}

export default async function BooksPage() {
  const supabase = createAdminClient()

  const [{ data: books }, { data: sections }] = await Promise.all([
    supabase
      .from('books')
      .select('id, name, position, is_published, chapter_count, book_groups(name)')
      .order('position')
      .returns<BookRow[]>(),
    supabase.from('sections').select('book_id'),
  ])

  const sectionCount = (sections ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.book_id] = (acc[s.book_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Livres</h1>
          <p className="text-sm text-slate-500">{(books ?? []).length} livres au total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
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
            {(books ?? []).map((book) => (
              <tr key={book.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-4 py-3 text-slate-400 text-xs tabular-nums">{book.position}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/books/${book.id}`}
                    className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors"
                  >
                    {book.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{book.book_groups?.name ?? '—'}</td>
                <td className="px-4 py-3 text-center text-slate-600 tabular-nums">{book.chapter_count}</td>
                <td className="px-4 py-3 text-center text-slate-600 tabular-nums">
                  {sectionCount[book.id] ?? 0}
                </td>
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
                  <Link href={`/books/${book.id}`}>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
