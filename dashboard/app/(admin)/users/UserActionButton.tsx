'use client'

import { useTransition } from 'react'

export default function UserActionButton({
  label,
  confirmMessage,
  action,
  variant = 'danger',
}: {
  label: string
  confirmMessage: string
  action: () => Promise<void>
  variant?: 'danger' | 'success'
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmMessage)) return
    startTransition(async () => { await action() })
  }

  const styles =
    variant === 'danger'
      ? 'border-red-300 text-red-700 hover:bg-red-50'
      : 'border-green-300 text-green-700 hover:bg-green-50'

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center px-3 py-1.5 text-sm border rounded-lg font-medium disabled:opacity-50 transition-colors ${styles}`}
    >
      {isPending ? '…' : label}
    </button>
  )
}
