import { ScrollText } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'

type Book = { id: string; name: string; chapter_count: number }
type Verse = { verse_number: number; text: string; translation: string }

export default async function VersesPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string; chapter?: string }>
}) {
  const { bookId, chapter: chapterParam } = await searchParams
  const chapter = chapterParam ? Number(chapterParam) : undefined

  const supabase = createAdminClient()
  const { data: books } = await supabase
    .from('books')
    .select('id, name, chapter_count')
    .order('position')

  const selectedBook = (books ?? []).find((b: Book) => b.id === bookId) ?? null

  let verses: Verse[] = []
  if (bookId && chapter && !isNaN(chapter)) {
    const { data } = await supabase
      .from('verses')
      .select('verse_number, text, translation')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .order('verse_number')
    verses = (data ?? []) as Verse[]
  }

  return (
    <div>
      <Breadcrumb crumbs={[{ label: 'Versets' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Texte biblique</h1>
      <p className="text-sm text-gray-500 mb-6">
        Lecture seule — Segond 1910. Les versets sont importés par script.
      </p>

      {/* Selector */}
      <form method="GET" className="flex flex-wrap items-end gap-3 mb-8">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Livre</label>
          <select
            name="bookId"
            defaultValue={bookId ?? ''}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          >
            <option value="">— Choisir un livre —</option>
            {(books ?? []).map((b: Book) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Chapitre{selectedBook ? ` (1–${selectedBook.chapter_count})` : ''}
          </label>
          <input
            name="chapter"
            type="number"
            min="1"
            max={selectedBook?.chapter_count ?? undefined}
            defaultValue={chapter ?? ''}
            placeholder="Ex : 1"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Afficher
        </button>
      </form>

      {/* Results */}
      {bookId && chapter ? (
        verses.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucun verset trouvé pour ce chapitre. Vérifiez que le texte a bien été importé.
          </p>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedBook?.name} — Chapitre {chapter}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({verses.length} versets)
              </span>
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 max-w-3xl">
              {verses.map((v) => (
                <p key={v.verse_number} className="text-gray-800 leading-relaxed">
                  <span className="inline-block w-8 text-right font-bold text-blue-600 mr-3 flex-shrink-0 select-none">
                    {v.verse_number}
                  </span>
                  {v.text}
                </p>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <ScrollText className="h-12 w-12 mb-4" />
          <p className="text-sm text-slate-400">Sélectionnez un livre et un chapitre pour afficher les versets.</p>
        </div>
      )}
    </div>
  )
}
