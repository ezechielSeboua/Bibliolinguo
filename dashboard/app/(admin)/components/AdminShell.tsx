'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, ScrollText, Users,
  BarChart2, Settings, LogOut, Menu, X,
  ChevronLeft, ChevronRight,
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

const STORAGE_KEY = 'bibliolingo-sidebar-collapsed'

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Restore preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'true') setCollapsed(true)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, String(!c))
      return !c
    })
  }

  const navLinks = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            title={collapsed && !isMobile ? label : undefined}
            className={cn(
              'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              collapsed && !isMobile ? 'justify-center gap-0' : 'gap-3',
              active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white',
            )}
          >
            <Icon className={cn(
              'h-4 w-4 flex-shrink-0 transition-colors',
              collapsed && !isMobile ? 'h-5 w-5' : '',
              active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300',
            )} />
            {(!collapsed || isMobile) && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  const footer = (isMobile = false) => (
    <div className="border-t border-slate-800 p-2">
      {(!collapsed || isMobile) && (
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1">
          <div className="h-7 w-7 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-indigo-400 uppercase">{userEmail.charAt(0)}</span>
          </div>
          <span className="text-xs text-slate-400 truncate flex-1">{userEmail}</span>
        </div>
      )}
      <form action={logoutAction}>
        <button
          type="submit"
          title={collapsed && !isMobile ? 'Déconnexion' : undefined}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors',
            collapsed && !isMobile ? 'justify-center' : 'gap-3',
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {(!collapsed || isMobile) && 'Déconnexion'}
        </button>
      </form>
    </div>
  )

  const logoHeader = (isMobile = false) => (
    <div className="flex h-16 items-center gap-2.5 px-3 border-b border-slate-800">
      <div className="rounded-xl bg-white overflow-hidden shrink-0 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Bibliolinguo_logo.png" alt="Bibliolinguo" width={36} height={36} className="block object-contain" />
      </div>
      {(!collapsed || isMobile) && (
        <>
          <span className="font-bold text-white tracking-tight flex-1 truncate">Bibliolingo</span>
          <span className="text-xs font-semibold text-indigo-300 bg-indigo-900 px-1.5 py-0.5 rounded shrink-0">Admin</span>
        </>
      )}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(false)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )

  const sidebarWidth = collapsed ? 'w-16' : 'w-60'
  const contentMargin = collapsed ? 'lg:ml-16' : 'lg:ml-60'

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className={cn(
        'hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300',
        sidebarWidth,
      )}>
        {logoHeader()}
        {navLinks()}
        {footer()}

        {/* Toggle collapse button */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all shadow-sm"
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </aside>

      {/* ── Mobile hamburger ────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 text-white shadow-md"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile overlay ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────── */}
      <aside className={cn(
        'lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {logoHeader(true)}
        {navLinks(true)}
        {footer(true)}
      </aside>

      {/* ── Content area ────────────────────────────────── */}
      <div className={cn('flex-1 transition-all duration-300', contentMargin)}>
        <main className="min-h-screen p-4 pt-16 lg:pt-8 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
