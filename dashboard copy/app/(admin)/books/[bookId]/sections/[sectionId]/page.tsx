import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import DeleteButton from '@/app/(admin)/components/DeleteButton'
import GameStatusSelect from '@/app/(admin)/components/GameStatusSelect'
import CreateGameForm from './CreateGameForm'
import { createGame, deleteGame, updateGameStatus } from './actions'

const TYPE_LABELS: Record<string, string> = {
  mcq: 'QCM',
  fill_verse: 'Compléter le verset',
  order: "Remettre dans l'ordre",
  match: 'Association',
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="flex items-center justify-center gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`inline-block w-2 h-2 rounded-full ${n <= level ? 'bg-blue-500' : 'bg-gray-200'}`}
        />
      ))}
    </span>
  )
}

type GameRow = {
  id: string
  position: number
  title: string
  type: string
  difficulty: number
  xp_reward: number
  status: string
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ bookId: string; sectionId: string }>
}) {
  const { bookId, sectionId } = await params
  const supabase = createAdminClient()

  const [{ data: section }, { data: games }] = await Promise.all([
    supabase
      .from('sections')
      .select('id, title, chapter_start, chapter_end, books(id, name)')
      .eq('id', sectionId)
      .maybeSingle(),
    supabase
      .from('games')
      .select('id, position, title, type, difficulty, xp_reward, status')
      .eq('section_id', sectionId)
      .order('position')
      .returns<GameRow[]>(),
  ])

  if (!section) notFound()

  const book = (section as any).books as { id: string; name: string } | null

  const gameIds = (games ?? []).map((g) => g.id)
  const { data: qs } = gameIds.length
    ? await supabase.from('questions').select('game_id').in('game_id', gameIds)
    : { data: [] }

  const questionCount = (qs ?? []).reduce<Record<string, number>>((acc, q) => {
    acc[q.game_id] = (acc[q.game_id] ?? 0) + 1
    return acc
  }, {})

  const chapterRange =
    section.chapter_start === section.chapter_end
      ? `Chapitre ${section.chapter_start}`
      : `Chapitres ${section.chapter_start}–${section.chapter_end}`

  const boundCreateGame = createGame.bind(null, sectionId, bookId)

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: 'Livres', href: '/books' },
          { label: book?.name ?? '…', href: `/books/${bookId}` },
          { label: section.title },
        ]}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{section.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{chapterRange}</p>

      {(games ?? []).length === 0 ? (
        <p className="text-gray-500 text-sm mb-4">Aucun jeu pour cette section.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Diff.</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">XP</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Questions</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(games ?? []).map((game) => {
                const boundDelete = deleteGame.bind(null, game.id, sectionId, bookId)
                const boundUpdateStatus = updateGameStatus.bind(null, game.id, sectionId, bookId)
                return (
                  <tr key={game.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{game.position}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/books/${bookId}/sections/${sectionId}/games/${game.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {game.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TYPE_LABELS[game.type] ?? game.type}
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyDots level={game.difficulty} />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{game.xp_reward}</td>
                    <td className="px-4 py-3 text-center">
                      <GameStatusSelect
                        currentStatus={game.status}
                        updateStatus={boundUpdateStatus}
                      />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {questionCount[game.id] ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteButton
                        action={boundDelete}
                        confirm="Supprimer ce jeu et toutes ses questions ?"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateGameForm createGame={boundCreateGame} />
    </div>
  )
}
