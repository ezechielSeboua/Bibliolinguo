import { createAdminClient } from '@/lib/supabase'
import Breadcrumb from '@/app/(admin)/components/Breadcrumb'
import SettingRow from './SettingRow'
import PublishToggle from './PublishToggle'
import { upsertSetting, toggleBookPublished } from './actions'

const DEFAULT_SETTINGS = [
  {
    key: 'xp_per_lesson',
    label: 'XP par leçon',
    description: "Points d'expérience accordés à la fin de chaque leçon.",
    defaultValue: '10',
  },
  {
    key: 'max_hearts',
    label: 'Nombre de cœurs',
    description: 'Nombre de cœurs (vies) disponibles par session.',
    defaultValue: '5',
  },
  {
    key: 'heart_refill_minutes',
    label: "Recharge d'un cœur (minutes)",
    description: "Temps en minutes avant qu'un cœur se recharge automatiquement.",
    defaultValue: '30',
  },
  {
    key: 'streak_freeze_cost',
    label: 'Coût du gel de série (XP)',
    description: 'XP nécessaire pour activer un gel de série (évite la rupture de streak).',
    defaultValue: '50',
  },
]

type Book = { id: string; name: string; is_published: boolean }
type Setting = { key: string; value: string }

export default async function SettingsPage() {
  const supabase = createAdminClient()

  const [{ data: rawSettings }, { data: books }] = await Promise.all([
    supabase.from('app_settings').select('key, value'),
    supabase.from('books').select('id, name, is_published').order('position'),
  ])

  const settingsMap = ((rawSettings ?? []) as Setting[]).reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {},
  )

  const boundUpsert = upsertSetting.bind(null)
  const boundToggle = toggleBookPublished.bind(null)

  return (
    <div>
      <Breadcrumb crumbs={[{ label: 'Réglages' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Réglages</h1>
      <p className="text-sm text-slate-500 mb-8">
        Paramètres globaux de l&apos;application et gestion de la publication.
      </p>

      {/* App settings */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Paramètres de l&apos;app</h2>
        <div className="bg-white rounded-xl border border-slate-200 px-5">
          {DEFAULT_SETTINGS.map((s) => (
            <SettingRow
              key={s.key}
              settingKey={s.key}
              label={s.label}
              description={s.description}
              currentValue={settingsMap[s.key] ?? s.defaultValue}
              upsertSetting={upsertSetting}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Ces valeurs sont lues par l&apos;app au démarrage depuis la table{' '}
          <code className="font-mono bg-slate-100 px-1 rounded">app_settings</code>.
        </p>
      </section>

      {/* Publication des livres */}
      <section>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Publication des livres</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Livre</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Publié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(books ?? []).map((book: Book) => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-800">{book.name}</td>
                  <td className="px-4 py-3 text-center">
                    <PublishToggle
                      bookId={book.id}
                      isPublished={book.is_published}
                      toggle={toggleBookPublished}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
