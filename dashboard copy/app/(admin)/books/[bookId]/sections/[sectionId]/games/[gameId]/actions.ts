'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'

function gamePath(bookId: string, sectionId: string, gameId: string) {
  return `/books/${bookId}/sections/${sectionId}/games/${gameId}`
}

// ── Game ──────────────────────────────────────────────────────────────────────

export async function updateGame(
  gameId: string,
  sectionId: string,
  bookId: string,
  formData: FormData,
) {
  const title = (formData.get('title') as string)?.trim()
  const difficulty = Number(formData.get('difficulty'))
  const xp_reward = Number(formData.get('xp_reward'))

  if (!title) throw new Error('Le titre est requis.')
  if (![1, 2, 3].includes(difficulty)) throw new Error('Difficulté invalide.')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('games')
    .update({ title, difficulty, xp_reward: xp_reward > 0 ? xp_reward : 10 })
    .eq('id', gameId)
  if (error) throw new Error(error.message)

  revalidatePath(`/books/${bookId}/sections/${sectionId}`)
  revalidatePath(gamePath(bookId, sectionId, gameId))
}

export async function updateGameStatus(
  gameId: string,
  sectionId: string,
  bookId: string,
  status: string,
) {
  if (!['draft', 'review', 'published'].includes(status)) throw new Error('Statut invalide.')
  const supabase = createAdminClient()
  const { error } = await supabase.from('games').update({ status }).eq('id', gameId)
  if (error) throw new Error(error.message)

  revalidatePath(`/books/${bookId}/sections/${sectionId}`)
  revalidatePath(gamePath(bookId, sectionId, gameId))
}

// ── Payload builder ───────────────────────────────────────────────────────────

function buildPayload(type: string, formData: FormData): Record<string, unknown> {
  if (type === 'mcq') {
    const options = [0, 1, 2, 3]
      .map((i) => (formData.get(`option_${i}`) as string)?.trim())
      .filter(Boolean)
    const answer_index = Number(formData.get('answer_index'))
    if (options.length < 2) throw new Error('Au moins 2 options requises.')
    if (answer_index < 0 || answer_index >= options.length)
      throw new Error('Sélectionnez la bonne réponse.')
    return { options, answer_index }
  }

  if (type === 'fill_verse') {
    const text_before = (formData.get('text_before') as string)?.trim()
    const text_after = ((formData.get('text_after') as string) ?? '').trim()
    const options = [0, 1, 2, 3]
      .map((i) => (formData.get(`option_${i}`) as string)?.trim())
      .filter(Boolean)
    const answer_index = Number(formData.get('answer_index'))
    if (!text_before) throw new Error('Le texte avant le trou est requis.')
    if (options.length < 2) throw new Error('Au moins 2 options requises.')
    if (answer_index < 0 || answer_index >= options.length)
      throw new Error('Sélectionnez la bonne réponse.')
    return { text_before, text_after, options, answer_index }
  }

  if (type === 'order') {
    const items = [0, 1, 2, 3, 4, 5]
      .map((i) => (formData.get(`item_${i}`) as string)?.trim())
      .filter(Boolean)
    if (items.length < 2) throw new Error('Au moins 2 éléments requis.')
    return { items, correct_order: items.map((_, i) => i) }
  }

  if (type === 'match') {
    const pairs = [0, 1, 2, 3]
      .map((i) => ({
        left: (formData.get(`pair_left_${i}`) as string)?.trim(),
        right: (formData.get(`pair_right_${i}`) as string)?.trim(),
      }))
      .filter((p) => p.left && p.right)
    if (pairs.length < 2) throw new Error('Au moins 2 paires requises.')
    return { pairs }
  }

  throw new Error('Type de jeu inconnu.')
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function createQuestion(
  gameId: string,
  sectionId: string,
  bookId: string,
  gameType: string,
  formData: FormData,
) {
  const prompt = ((formData.get('prompt') as string) ?? '').trim()
  const reference = ((formData.get('reference') as string) ?? '').trim()
  const difficulty = Number(formData.get('difficulty'))

  if (![1, 2, 3].includes(difficulty)) throw new Error('Difficulté invalide.')

  const payload = buildPayload(gameType, formData)

  const supabase = createAdminClient()
  const { data: last } = await supabase
    .from('questions')
    .select('position')
    .eq('game_id', gameId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('questions').insert({
    game_id: gameId,
    prompt,
    reference,
    difficulty,
    payload,
    position: (last?.position ?? 0) + 1,
  })
  if (error) throw new Error(error.message)

  revalidatePath(gamePath(bookId, sectionId, gameId))
}

export async function deleteQuestion(
  questionId: string,
  gameId: string,
  sectionId: string,
  bookId: string,
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath(gamePath(bookId, sectionId, gameId))
}
