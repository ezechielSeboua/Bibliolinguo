import { BookOpen } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import BooksTable from './BooksTable'

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

  const booksWithCount = (books ?? []).map((b) => ({
    ...b,
    sectionCount: sectionCount[b.id] ?? 0,
  }))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Livres</h1>
          <p className="text-sm text-slate-500">{booksWithCount.length} livres au total</p>
        </div>
      </div>

      <BooksTable books={booksWithCount} />
    </div>
  )
}
