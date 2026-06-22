import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import ClickableRow from '@/app/(admin)/components/ClickableRow'
import CreateSectionForm from './CreateSectionForm'
import { createSection } from './actions'

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
        <h1 className="text-2xl font-bold text-slate-900">{book.name}</h1>
        {book.is_published ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Publié
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
            Brouillon
          </span>
        )}
      </div>

      {(sections ?? []).length === 0 ? (
        <p className="text-slate-500 text-sm mb-4">Aucune section pour ce livre.</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Titre</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Chapitres</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Jeux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(sections ?? []).map((section) => (
                <ClickableRow key={section.id} href={`/books/${bookId}/sections/${section.id}`} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-4 py-3 text-slate-400">{section.position}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {section.title}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {section.chapter_start === section.chapter_end
                      ? section.chapter_start
                      : `${section.chapter_start}–${section.chapter_end}`}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {gameCount[section.id] ?? 0}
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateSectionForm createSection={createSection.bind(null, bookId)} />
    </div>
  )
}
