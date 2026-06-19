import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import GameStatusSelect from '@/app/(admin)/components/GameStatusSelect'
import DeleteButton from '@/app/(admin)/components/DeleteButton'
import EditGameForm from './EditGameForm'
import QuestionForm from './QuestionForm'
import QuestionPreview from './QuestionPreview'
import VersePanel from './VersePanel'
import {
  updateGame,
  updateGameStatus,
  createQuestion,
  deleteQuestion,
} from './actions'

const TYPE_LABELS: Record<string, string> = {
  mcq: 'QCM',
  fill_verse: 'Compléter le verset',
  order: "Remettre dans l'ordre",
  match: 'Association',
}

const DIFF_LABELS: Record<number, string> = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' }

type QuestionRow = {
  id: string
  position: number
  prompt: string
  reference: string
  difficulty: number
  payload: Record<string, unknown>
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ bookId: string; sectionId: string; gameId: string }>
}) {
  const { bookId, sectionId, gameId } = await params
  const supabase = createAdminClient()

  const [{ data: game }, { data: questions }, { data: section }, { data: books }] =
    await Promise.all([
      supabase
        .from('games')
        .select('id, title, type, difficulty, xp_reward, status, section_id')
        .eq('id', gameId)
        .maybeSingle(),
      supabase
        .from('questions')
        .select('id, position, prompt, reference, difficulty, payload')
        .eq('game_id', gameId)
        .order('position')
        .returns<QuestionRow[]>(),
      supabase
        .from('sections')
        .select('title, books(id, name)')
        .eq('id', sectionId)
        .maybeSingle(),
      supabase.from('books').select('id, name').order('position'),
    ])

  if (!game) notFound()

  const sectionTitle = (section as any)?.title ?? '…'
  const bookName = ((section as any)?.books as { name: string } | null)?.name ?? '…'

  const boundUpdateGame = updateGame.bind(null, gameId, sectionId, bookId)
  const boundUpdateStatus = updateGameStatus.bind(null, gameId, sectionId, bookId)
  const boundCreateQuestion = createQuestion.bind(null, gameId, sectionId, bookId, game.type)

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: 'Livres', href: '/books' },
          { label: bookName, href: `/books/${bookId}` },
          { label: sectionTitle, href: `/books/${bookId}/sections/${sectionId}` },
          { label: game.title },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{game.title}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {TYPE_LABELS[game.type] ?? game.type}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {DIFF_LABELS[game.difficulty]} · {game.xp_reward} XP
          </p>
          <EditGameForm
            gameId={gameId}
            initialTitle={game.title}
            initialDifficulty={game.difficulty}
            initialXp={game.xp_reward}
            updateGame={boundUpdateGame}
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <GameStatusSelect currentStatus={game.status} updateStatus={boundUpdateStatus} />
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions column */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Questions{' '}
            <span className="text-gray-400 font-normal text-sm">
              ({(questions ?? []).length})
            </span>
          </h2>

          {(questions ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune question pour ce jeu.</p>
          ) : (
            <div className="space-y-3">
              {(questions ?? []).map((q, idx) => {
                const boundDelete = deleteQuestion.bind(null, q.id, gameId, sectionId, bookId)
                return (
                  <div
                    key={q.id}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
                          {q.reference && (
                            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                              {q.reference}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {DIFF_LABELS[q.difficulty]}
                          </span>
                        </div>
                        <QuestionPreview
                          type={game.type}
                          prompt={q.prompt}
                          payload={q.payload}
                        />
                      </div>
                      <DeleteButton
                        action={boundDelete}
                        confirm="Supprimer cette question ?"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <QuestionForm gameType={game.type} createQuestion={boundCreateQuestion} />
        </div>

        {/* Verse panel sidebar */}
        <div>
          <VersePanel books={(books ?? []) as { id: string; name: string }[]} />
        </div>
      </div>
    </div>
  )
}
