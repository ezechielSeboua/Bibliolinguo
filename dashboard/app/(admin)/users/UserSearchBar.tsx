'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

export default function UserSearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
        params.delete('page')
      } else {
        params.delete('q')
      }
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }, 300)
  }

  function handleClear(input: HTMLInputElement) {
    input.value = ''
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="relative group w-72">
      {isPending
        ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 animate-spin" />
        : <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      }
      <input
        type="search"
        defaultValue={defaultValue}
        placeholder="Rechercher par email…"
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
      />
      {defaultValue && (
        <button
          onClick={(e) => handleClear(e.currentTarget.closest('.group')!.querySelector('input')!)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
