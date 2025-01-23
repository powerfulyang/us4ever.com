import type { ReactNode } from 'react'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CommonLayoutProps {
  title: string
  description?: string
  children: ReactNode
  actionHref?: string
  actionText?: string
}

export function Container({
  title,
  description,
  children,
  actionHref,
  actionText,
}: CommonLayoutProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="px-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            {title}
          </h1>
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        {actionHref && actionText && (
          <AuthenticatedOnly>
            <Button>
              <Link href={actionHref}>{actionText}</Link>
            </Button>
          </AuthenticatedOnly>
        )}
      </div>
      {children}
    </div>
  )
}
