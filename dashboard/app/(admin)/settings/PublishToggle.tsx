'use client'

import { useTransition } from 'react'

export default function PublishToggle({
  bookId,
  isPublished,
  toggle,
}: {
  bookId: string
  isPublished: boolean
  toggle: (bookId: string, current: boolean) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await toggle(bookId, isPublished) })}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
        isPublished ? 'bg-green-500' : 'bg-gray-300'
      }`}
      title={isPublished ? 'Dépublier' : 'Publier'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          isPublished ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
