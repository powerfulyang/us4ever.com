'use client'

import { usePathname, useSearchParams } from 'next/navigation'
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

  useEffect(() => {
    if (isMobile && FEED_ROUTES[pathname]) {
      const params = searchParams.toString()
      const redirectUrl = params
        ? `${FEED_ROUTES[pathname]}?${params}`
        : FEED_ROUTES[pathname]
      window.location.href = redirectUrl
    }
  }, [isMobile, pathname, searchParams])

  return null
}
