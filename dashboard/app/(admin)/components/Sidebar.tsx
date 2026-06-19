'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  ScrollText,
  Users,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { logoutAction } from '@/app/login/actions'

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/books',     label: 'Livres & Jeux',   icon: BookOpen },
  { href: '/verses',    label: 'Versets',          icon: ScrollText },
  { href: '/users',     label: 'Utilisateurs',     icon: Users },
  { href: '/stats',     label: 'Statistiques',     icon: BarChart2 },
  { href: '/settings',  label: 'Réglages',         icon: Settings },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-slate-800">
        <div className="rounded-xl bg-white overflow-hidden shrink-0 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Bibliolinguo_logo.png" alt="Bibliolingo" width={36} height={36} className="block object-contain" />
        </div>
        <span className="font-bold text-white tracking-tight">Bibliolingo</span>
        <span className="ml-auto text-xs text-slate-500 font-medium shrink-0">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0 transition-colors', active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1">
          <div className="h-7 w-7 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-indigo-400 uppercase">
              {userEmail.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-slate-400 truncate flex-1">{userEmail}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  )
}
