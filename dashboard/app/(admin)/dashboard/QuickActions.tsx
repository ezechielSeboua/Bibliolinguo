'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, BookOpen, Users, BarChart2, Settings, FileEdit } from 'lucide-react'

type Props = {
  reviewGames: number
  draftGames: number
  unpublishedBooks: number
  totalUsers: number
}

export default function QuickActions({ reviewGames, draftGames, unpublishedBooks, totalUsers }: Props) {
  const actions = [
    {
      href: '/books',
      label: 'Jeux à relire',
      description: reviewGames > 0
        ? `${reviewGames} jeu${reviewGames > 1 ? 'x' : ''} en attente de validation`
        : 'Aucun jeu en attente de relecture',
      icon: AlertCircle,
      badge: reviewGames > 0 ? reviewGames : null,
      badgeColor: 'bg-amber-100 text-amber-700',
      iconColor: 'bg-amber-50 text-amber-600',
      urgent: reviewGames > 0,
    },
    {
      href: '/books',
      label: 'Brouillons',
      description: draftGames > 0
        ? `${draftGames} jeu${draftGames > 1 ? 'x' : ''} non encore soumis`
        : 'Tous les jeux sont soumis',
      icon: FileEdit,
      badge: draftGames > 0 ? draftGames : null,
      badgeColor: 'bg-slate-100 text-slate-600',
      iconColor: 'bg-slate-100 text-slate-500',
      urgent: false,
    },
    {
      href: '/settings',
      label: 'Livres non publiés',
      description: unpublishedBooks > 0
        ? `${unpublishedBooks} livre${unpublishedBooks > 1 ? 's' : ''} en brouillon`
        : 'Tous les livres sont publiés',
      icon: BookOpen,
      badge: unpublishedBooks > 0 ? unpublishedBooks : null,
      badgeColor: 'bg-indigo-100 text-indigo-700',
      iconColor: 'bg-indigo-50 text-indigo-600',
      urgent: false,
    },
    {
      href: '/users',
      label: 'Utilisateurs',
      description: `${totalUsers.toLocaleString('fr-FR')} compte${totalUsers !== 1 ? 's' : ''} inscrits au total`,
      icon: Users,
      badge: null,
      badgeColor: '',
      iconColor: 'bg-sky-50 text-sky-600',
      urgent: false,
    },
    {
      href: '/stats',
      label: 'Statistiques',
      description: 'Voir la vue d\'ensemble du contenu',
      icon: BarChart2,
      badge: null,
      badgeColor: '',
      iconColor: 'bg-violet-50 text-violet-600',
      urgent: false,
    },
    {
      href: '/settings',
      label: 'Réglages',
      description: 'Paramètres globaux de l\'application',
      icon: Settings,
      badge: null,
      badgeColor: '',
      iconColor: 'bg-rose-50 text-rose-500',
      urgent: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, i) => (
        <motion.div
          key={`${action.href}-${action.label}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
        >
          <Link href={action.href} className="group block h-full">
            <div className={`bg-white rounded-xl border p-5 h-full hover:shadow-md transition-all duration-200 ${
              action.urgent
                ? 'border-amber-200 hover:border-amber-300'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${action.iconColor}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                {action.badge !== null && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${action.badgeColor}`}>
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {action.label}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{action.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
