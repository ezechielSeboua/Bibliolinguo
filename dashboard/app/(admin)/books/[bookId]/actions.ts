'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'

export async function createSection(bookId: string, formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const chapter_start = Number(formData.get('chapter_start'))
  const chapter_end = Number(formData.get('chapter_end'))

  if (!title) throw new Error('Le titre est requis.')
  if (!chapter_start || chapter_start < 1) throw new Error('Chapitre de début invalide.')
  if (!chapter_end || chapter_end < chapter_start) throw new Error('Chapitre de fin invalide (doit être ≥ chapitre de début).')

  const supabase = createAdminClient()

  const { data: last } = await supabase
    .from('sections')
    .select('position')
    .eq('book_id', bookId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('sections').insert({
    book_id: bookId,
    title,
    chapter_start,
    chapter_end,
    position: (last?.position ?? 0) + 1,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/books/${bookId}`)
}
