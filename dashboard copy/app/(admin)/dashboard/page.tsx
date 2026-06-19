import { createAdminClient } from '@/lib/supabase'
import AnimatedCards from './AnimatedCards'

export default async function DashboardPage() {
  const supabase = createAdminClient()

  const [
    { count: totalGames },
    { count: publishedGames },
    { count: totalQuestions },
    usersData,
  ] = await Promise.all([
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.auth.admin.listUsers({ perPage: 1 }),
  ])

  const stats = [
    { label: 'Utilisateurs',  value: ('total' in (usersData.data ?? {})) ? (usersData.data as { total: number }).total : 0 },
    { label: 'Jeux créés',    value: totalGames ?? 0 },
    { label: 'Jeux publiés',  value: publishedGames ?? 0 },
    { label: 'Questions',     value: totalQuestions ?? 0 },
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
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">
              {s.value.toLocaleString('fr-FR')}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Espaces</h2>
      <AnimatedCards />
    </div>
  )
}
