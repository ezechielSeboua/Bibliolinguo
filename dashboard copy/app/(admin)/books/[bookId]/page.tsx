import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'

type SectionRow = {
  id: string
  position: number
  title: string
  chapter_start: number
  chapter_end: number
}

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const supabase = createAdminClient()

  const [{ data: book }, { data: sections }] = await Promise.all([
    supabase.from('books').select('id, name, is_published').eq('id', bookId).maybeSingle(),
    supabase
      .from('sections')
      .select('id, position, title, chapter_start, chapter_end')
      .eq('book_id', bookId)
      .order('position')
      .returns<SectionRow[]>(),
  ])

  if (!book) notFound()

  const sectionIds = (sections ?? []).map((s) => s.id)
  const { data: games } = sectionIds.length
    ? await supabase.from('games').select('section_id').in('section_id', sectionIds)
    : { data: [] }

  const gameCount = (games ?? []).reduce<Record<string, number>>((acc, g) => {
    acc[g.section_id] = (acc[g.section_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <Breadcrumb crumbs={[{ label: 'Livres', href: '/books' }, { label: book.name }]} />

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{book.name}</h1>
        {book.is_published ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Publié
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Brouillon
          </span>
        )}
      </div>

      {(sections ?? []).length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune section pour ce livre.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Chapitres</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Jeux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(sections ?? []).map((section) => (
                <tr key={section.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{section.position}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/books/${bookId}/sections/${section.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {section.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {section.chapter_start === section.chapter_end
                      ? section.chapter_start
                      : `${section.chapter_start}–${section.chapter_end}`}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {gameCount[section.id] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
