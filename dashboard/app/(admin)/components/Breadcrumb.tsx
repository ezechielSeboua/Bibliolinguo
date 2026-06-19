import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; href?: string }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-6">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
            {isLast || !crumb.href ? (
              <span className={isLast ? 'font-medium text-slate-700' : 'text-slate-400'}>
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="text-slate-400 hover:text-indigo-600 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
