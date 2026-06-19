'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'

export async function upsertSetting(key: string, value: string) {
  if (!key.trim()) throw new Error('Clé invalide.')
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function toggleBookPublished(bookId: string, current: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('books')
    .update({ is_published: !current })
    .eq('id', bookId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
  revalidatePath('/books')
}
