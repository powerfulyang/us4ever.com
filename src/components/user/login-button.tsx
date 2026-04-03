'use client'

import { BadgeCheck, Globe, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

const LOGIN_PROVIDERS = [
  {
    key: 'google',
    label: 'Google',
    icon: Globe,
  },
  {
    key: 'github',
    label: 'GitHub',
    icon: BadgeCheck,
  },
  {
    key: 'discord',
    label: 'Discord',
    icon: MessageCircle,
  },
] as const

export default function LoginButton() {
  const loginOptions = useMemo(() => {
    if (typeof window === 'undefined') {
      return []
    }

    const origin = window.location.origin
    const currentUrl = window.location.href
    const callbackUrl = `${origin}/api/lp?_redirect=${encodeURIComponent(currentUrl)}`

    return LOGIN_PROVIDERS.map(provider => ({
      ...provider,
      href: `https://api.littleeleven.com/api/auth/${provider.key}?_redirect=${encodeURIComponent(callbackUrl)}`,
    }))
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          登录
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>选择登录方式</DialogTitle>
          <DialogDescription>
            通过 LittleEleven 统一认证登录当前页面。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {loginOptions.map((option) => {
            const Icon = option.icon

            return (
              <Link
                key={option.key}
                href={option.href}
                className={cn(
                  'flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  使用
                  {option.label}
                  登录
                </span>
              </Link>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
