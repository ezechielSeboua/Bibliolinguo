'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'

export async function suspendUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876600h', // 100 years ≈ permanent
  })
  if (error) throw new Error(error.message)
  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
}

export async function reactivateUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
}
