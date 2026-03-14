'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-is-mobile'

const FEED_ROUTES: Record<string, string> = {
  '/keep': '/keep/feed',
  '/todo': '/todo/feed',
  '/moment': '/moment/feed',
  '/mindmap': '/mindmap/feed',
  '/image': '/image/feed',
}

export function MobileRedirect() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const router = useRouter()

  useEffect(() => {
    if (isMobile && FEED_ROUTES[pathname]) {
      const params = searchParams.toString()
      const redirectUrl = params
        ? `${FEED_ROUTES[pathname]}?${params}`
        : FEED_ROUTES[pathname]
      router.replace(redirectUrl)
    }
  }, [isMobile, pathname, searchParams, router])

  return null
}
