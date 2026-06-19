'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'

function sectionPath(bookId: string, sectionId: string) {
  return `/books/${bookId}/sections/${sectionId}`
}

export async function createGame(sectionId: string, bookId: string, formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const type = formData.get('type') as string
  const difficulty = Number(formData.get('difficulty'))
  const xp_reward = Number(formData.get('xp_reward'))

  if (!title) throw new Error('Le titre est requis.')
  if (!['mcq', 'fill_verse', 'order', 'match'].includes(type)) throw new Error('Type invalide.')
  if (![1, 2, 3].includes(difficulty)) throw new Error('Difficulté invalide.')

  const supabase = createAdminClient()
  const { data: last } = await supabase
    .from('games')
    .select('position')
    .eq('section_id', sectionId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('games').insert({
    section_id: sectionId,
    title,
    type,
    difficulty,
    xp_reward: xp_reward > 0 ? xp_reward : 10,
    status: 'draft',
    position: (last?.position ?? 0) + 1,
  })
  if (error) throw new Error(error.message)

  revalidatePath(sectionPath(bookId, sectionId))
}

export async function deleteGame(gameId: string, sectionId: string, bookId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('games').delete().eq('id', gameId)
  if (error) throw new Error(error.message)
  revalidatePath(sectionPath(bookId, sectionId))
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
  revalidatePath(sectionPath(bookId, sectionId))
}
