import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase'
import { Toaster } from 'sonner'
import AdminShell from './components/AdminShell'
import PageTransition from './components/PageTransition'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) redirect('/login')

  const supabase = createAdminClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) redirect('/login')

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) redirect('/login')

  return (
    <>
      <AdminShell userEmail={user.email ?? ''}>
        <PageTransition>{children}</PageTransition>
      </AdminShell>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  )
}
