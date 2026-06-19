'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ScrollText, Users, BarChart2, Settings } from 'lucide-react'

const CARDS = [
  {
    href: '/books',
    label: 'Livres & Jeux',
    description: 'Gérer livres, sections, jeux et questions.',
    icon: BookOpen,
    light: 'bg-indigo-50 text-indigo-600',
  },
  {
    href: '/verses',
    label: 'Versets',
    description: 'Texte biblique Segond 1910 par livre et chapitre.',
    icon: ScrollText,
    light: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/users',
    label: 'Utilisateurs',
    description: 'Comptes, progression, suspension.',
    icon: Users,
    light: 'bg-sky-50 text-sky-600',
  },
  {
    href: '/stats',
    label: 'Statistiques',
    description: 'Jeux publiés, questions, livres.',
    icon: BarChart2,
    light: 'bg-violet-50 text-violet-600',
  },
  {
    href: '/settings',
    label: 'Réglages',
    description: 'Paramètres globaux et publication.',
    icon: Settings,
    light: 'bg-amber-50 text-amber-600',
  },
]

export default function AnimatedCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.href}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.07, ease: 'easeOut' }}
        >
          <Link href={card.href} className="group block h-full">
            <div className="bg-white rounded-xl border border-slate-200 p-5 h-full hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${card.light}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {card.label}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
