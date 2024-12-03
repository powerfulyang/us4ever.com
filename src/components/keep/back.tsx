'use client'

import type { FC, HTMLAttributes, PropsWithChildren } from 'react'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const Back: FC<
  PropsWithChildren<
    HTMLAttributes<HTMLDivElement> & {
      fallback?: string
    }
  >
> = ({ className, fallback, ...props }) => {
  const router = useRouter()
  // 判断 window.document.referrer 是不是同源的
  const [isSameOrigin, setIsSameOrigin] = useState(false)

  useEffect(() => {
    const origin = window.location.origin
    const referrer = window.document.referrer
    setIsSameOrigin(referrer.startsWith(origin))
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
