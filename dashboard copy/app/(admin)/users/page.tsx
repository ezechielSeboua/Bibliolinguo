import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'

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
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const perPage = 50

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage,
  })

  const users = data?.users ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <Breadcrumb crumbs={[{ label: 'Utilisateurs' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} compte{total !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          Erreur : {error.message}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Inscription</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Dernière connexion</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Aucun utilisateur.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isBanned = u.banned_until && new Date(u.banned_until) > new Date()
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/users/${u.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {u.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.created_at ? formatDate(u.created_at) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.last_sign_in_at ? formatDate(u.last_sign_in_at) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBanned ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          Suspendu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/users/${u.id}`}
                        className="text-xs text-gray-500 hover:text-blue-600 hover:underline"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/users?page=${page - 1}`}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/users?page=${page + 1}`}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
