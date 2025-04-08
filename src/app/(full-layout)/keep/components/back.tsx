'use client'

import type { FC, HTMLAttributes, PropsWithChildren } from 'react'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export const Back: FC<
  PropsWithChildren<
    HTMLAttributes<HTMLDivElement> & {
      fallback?: string
    }
  >
> = ({ className, fallback, ...props }) => {
  const router = useRouter()
  const isSameOrigin = useMemo(() => {
    if (typeof window === 'undefined')
      return false

    try {
      const referrerOrigin = new URL(document.referrer).origin
      return window.location.origin === referrerOrigin
    }
    catch {
      return false
    }
  }, [])

  function handleBack() {
    if (isSameOrigin) {
      router.back()
    }
    else {
      router.push(fallback ?? '/')
    }
  }

  return (
    <div
      {...props}
      className={clsx(className, 'cursor-pointer')}
      onClick={handleBack}
    />
  )
}
