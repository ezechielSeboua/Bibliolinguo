import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase'
import Sidebar from './components/Sidebar'
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userEmail={user.email ?? ''} />
      <div className="flex-1 ml-60">
        <main className="min-h-screen p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
