import { Users, Gamepad2, CheckCircle2, HelpCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import QuickActions from './QuickActions'

export default async function DashboardPage() {
  const supabase = createAdminClient()

  const [
    { count: totalGames },
    { count: publishedGames },
    { count: reviewGames },
    { count: draftGames },
    { count: totalQuestions },
    { count: unpublishedBooks },
    usersData,
  ] = await Promise.all([
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.auth.admin.listUsers({ perPage: 1 }),
  ])

  const totalUsers = ('total' in (usersData.data ?? {}))
    ? (usersData.data as { total: number }).total
    : 0

  const stats = [
    { label: 'Utilisateurs',  value: totalUsers,          icon: Users,        color: 'bg-sky-50 text-sky-600' },
    { label: 'Jeux créés',    value: totalGames ?? 0,     icon: Gamepad2,     color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Jeux publiés',  value: publishedGames ?? 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Questions',     value: totalQuestions ?? 0, icon: HelpCircle,   color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Bienvenue sur le dashboard admin de Bibliolingo.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 tabular-nums">
              {s.value.toLocaleString('fr-FR')}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Actions rapides</h2>
      <QuickActions
        reviewGames={reviewGames ?? 0}
        draftGames={draftGames ?? 0}
        unpublishedBooks={unpublishedBooks ?? 0}
        totalUsers={totalUsers}
      />
    </div>
  )
}
