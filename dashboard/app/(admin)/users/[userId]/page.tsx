import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import UserActionButton from '../UserActionButton'
import CopyId from '../CopyId'
import { suspendUser, reactivateUser, resetHearts } from '../actions'

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = createAdminClient()

  const { data: userData, error } = await supabase.auth.admin.getUserById(userId)
  if (error || !userData?.user) notFound()

  const user = userData.user
  const isBanned = user.banned_until && new Date(user.banned_until) > new Date()

  // Fetch profile (may not exist for all users)
  const [{ data: profile }, { count: completedGames }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase
      .from('game_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true),
  ])

  const boundSuspend = suspendUser.bind(null, userId)
  const boundReactivate = reactivateUser.bind(null, userId)
  const boundResetHearts = resetHearts.bind(null, userId)

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: 'Utilisateurs', href: '/users' },
          { label: user.email ?? userId },
        ]}
      />

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user.email}</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
            ID : <CopyId id={user.id} />
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isBanned ? (
            <UserActionButton
              label="Réactiver le compte"
              confirmMessage={`Réactiver le compte de ${user.email} ?`}
              action={boundReactivate}
              variant="success"
            />
          ) : (
            <UserActionButton
              label="Suspendre le compte"
              confirmMessage={`Suspendre le compte de ${user.email} ? L'utilisateur ne pourra plus se connecter.`}
              action={boundSuspend}
              variant="danger"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm uppercase tracking-wide">
            Compte
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Statut</dt>
              <dd>
                {isBanned ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    Suspendu
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    Actif
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Email confirmé</dt>
              <dd className="text-slate-800">{user.email_confirmed_at ? 'Oui' : 'Non'}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Inscription</dt>
              <dd className="text-slate-800">{formatDate(user.created_at)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Dernière connexion</dt>
              <dd className="text-slate-800">{formatDate(user.last_sign_in_at)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Fournisseur</dt>
              <dd className="text-slate-800">
                {user.app_metadata?.provider ?? '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Progression */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm uppercase tracking-wide">
            Progression
          </h2>
          {profile ? (
            <dl className="space-y-3">
              {typeof (profile as any).xp !== 'undefined' && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-500">XP total</dt>
                  <dd className="text-slate-800 font-medium">{(profile as any).xp ?? 0}</dd>
                </div>
              )}
              {typeof (profile as any).streak !== 'undefined' && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-500">Série actuelle</dt>
                  <dd className="text-slate-800 font-medium">{(profile as any).streak ?? 0} jours</dd>
                </div>
              )}
              {typeof (profile as any).level !== 'undefined' && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-500">Niveau</dt>
                  <dd className="text-slate-800 font-medium">{(profile as any).level ?? 1}</dd>
                </div>
              )}
              {typeof (profile as any).hearts !== 'undefined' && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-500">Cœurs restants</dt>
                  <dd className="text-slate-800 font-medium flex items-center gap-2">
                    {(profile as any).hearts ?? 0} / 5
                    {((profile as any).hearts ?? 5) < 5 && (
                      <UserActionButton
                        label="Rétablir"
                        confirmMessage={`Remettre les cœurs de ${user.email} à 5 ?`}
                        action={boundResetHearts}
                        successMessage="Cœurs rétablis"
                        variant="success"
                      />
                    )}
                  </dd>
                </div>
              )}
              {typeof (profile as any).hearts !== 'undefined' &&
                (profile as any).hearts_refill_at && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-500">Prochain cœur</dt>
                  <dd className="text-slate-800">{formatDate((profile as any).hearts_refill_at)}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Jeux complétés</dt>
                <dd className="text-slate-800 font-medium">{completedGames ?? 0}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">
              Aucun profil trouvé pour cet utilisateur.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
