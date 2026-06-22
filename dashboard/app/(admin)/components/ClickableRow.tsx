'use client'

import { useRouter } from 'next/navigation'
import { type ComponentPropsWithoutRef } from 'react'

type Props = ComponentPropsWithoutRef<'tr'> & { href: string }

export default function ClickableRow({ href, className = '', children, ...props }: Props) {
  const router = useRouter()
  return (
    <tr
      onClick={() => router.push(href)}
      className={`cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}
