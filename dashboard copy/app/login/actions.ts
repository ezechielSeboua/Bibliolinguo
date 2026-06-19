'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'

export type LoginState = { error: string | null }

export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email et mot de passe requis.' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session || !data.user) {
    return { error: `Identifiants invalides. (${error?.message ?? 'no session'})` }
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!admin) {
    return { error: "Accès refusé : vous n'êtes pas administrateur." }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/dashboard')
}

export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
  redirect('/login')
}
