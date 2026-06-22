import { BookOpen, Layers, Gamepad2, HelpCircle, ScrollText, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import StatsBreakdown from './StatsBreakdown'
import { LucideIcon } from 'lucide-react'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  sub?: string
  icon: LucideIcon
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">{value.toLocaleString('fr-FR')}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
    </div>
  )
}

export default async function StatsPage() {
  const supabase = createAdminClient()

  const [
    { count: totalBooks },
    { count: publishedBooks },
    { count: totalSections },
    { count: totalGames },
    { count: draftGames },
    { count: reviewGames },
    { count: publishedGames },
    { count: totalQuestions },
    { count: totalVerses },
    usersData,
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('sections').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('verses').select('*', { count: 'exact', head: true }),
    supabase.auth.admin.listUsers({ perPage: 1 }),
  ])

  const totalUsers = usersData.data?.total ?? 0

  const breakdown = [
    { label: 'Publiés',    count: publishedGames ?? 0, bg: 'bg-emerald-500' },
    { label: 'À relire',   count: reviewGames ?? 0,    bg: 'bg-amber-400' },
    { label: 'Brouillons', count: draftGames ?? 0,     bg: 'bg-slate-300' },
  ]

  return (
    <div>
      <Breadcrumb crumbs={[{ label: 'Statistiques' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Statistiques</h1>
      <p className="text-sm text-slate-500 mb-8">Vue d&apos;ensemble du contenu et des utilisateurs.</p>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Utilisateurs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-sm">
        <StatCard label="Comptes inscrits" value={totalUsers} icon={Users} color="bg-sky-50 text-sky-600" />
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Contenu</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Livres"    value={totalBooks ?? 0}     sub={`${publishedBooks ?? 0} publiés`}    icon={BookOpen}   color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Sections"  value={totalSections ?? 0}                                              icon={Layers}     color="bg-violet-50 text-violet-600" />
        <StatCard label="Jeux"      value={totalGames ?? 0}     sub={`${publishedGames ?? 0} publiés`}     icon={Gamepad2}   color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Questions" value={totalQuestions ?? 0}                                             icon={HelpCircle} color="bg-amber-50 text-amber-600" />
        <StatCard label="Versets"   value={totalVerses ?? 0}    sub="Segond 1910"                          icon={ScrollText} color="bg-rose-50 text-rose-600" />
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Jeux par statut</h2>
      <StatsBreakdown breakdown={breakdown} total={totalGames ?? 0} />
    </div>
  )
}
