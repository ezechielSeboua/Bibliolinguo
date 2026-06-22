import Link from 'next/link'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import UserSearchBar from './UserSearchBar'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q } = await searchParams
  const query = q?.trim().toLowerCase() ?? ''
  const page = Math.max(1, Number(pageParam) || 1)
  const perPage = 50

  const supabase = createAdminClient()

  let users: Awaited<ReturnType<typeof supabase.auth.admin.listUsers>>['data']['users'] = []
  let total = 0
  let totalPages = 0
  let error: { message: string } | null = null

  if (query) {
    // Charger jusqu'à 1000 utilisateurs et filtrer côté serveur
    const { data, error: err } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    error = err
    const all = data?.users ?? []
    users = all.filter((u) => u.email?.toLowerCase().includes(query))
    total = users.length
    totalPages = 0
  } else {
    const { data, error: err } = await supabase.auth.admin.listUsers({ page, perPage })
    error = err
    users = data?.users ?? []
    total = data?.total ?? 0
    totalPages = Math.ceil(total / perPage)
  }

  return (
    <div>
      <Breadcrumb crumbs={[{ label: 'Utilisateurs' }]} />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {query
              ? `${users.length} résultat${users.length !== 1 ? 's' : ''} pour « ${q} »`
              : `${total} compte${total !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <Suspense>
          <UserSearchBar defaultValue={q ?? ''} />
        </Suspense>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          Erreur : {error.message}
        </p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Inscription</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Dernière connexion</th>
              <th className="text-center px-4 py-3 font-medium text-slate-600">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">
                  {query ? `Aucun utilisateur ne correspond à « ${q} ».` : 'Aucun utilisateur.'}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isBanned = u.banned_until && new Date(u.banned_until) > new Date()
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/users/${u.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        {u.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.created_at ? formatDate(u.created_at) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.last_sign_in_at ? formatDate(u.last_sign_in_at) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBanned ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          Suspendu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/users/${u.id}`}
                        className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        Détail →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (masquée si recherche active) */}
      {!query && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>Page {page} sur {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/users?page=${page - 1}`}
                className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Précédent
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7
                ? i + 1
                : i === 0 ? 1
                : i === 6 ? totalPages
                : page <= 4 ? i + 1
                : page >= totalPages - 3 ? totalPages - 6 + i
                : page - 3 + i
              return (
                <Link
                  key={p}
                  href={`/users?page=${p}`}
                  className={`px-3 py-1.5 border rounded-lg transition-colors ${
                    p === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
            {page < totalPages && (
              <Link
                href={`/users?page=${page + 1}`}
                className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
