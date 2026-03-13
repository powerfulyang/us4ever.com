import Link from 'next/link'
import { useMemo } from 'react'

export default function LoginButton() {
  const loginUrl = useMemo(() => {
    if (typeof window === 'undefined')
      return ''
    const origin = window.location.origin
    const currentUrl = window.location.href
    const redirect = `${origin}/api/lp?_redirect=${encodeURIComponent(currentUrl)}`
    return `https://api.littleeleven.com/api/auth/google?_redirect=${encodeURIComponent(redirect)}`
  }, [])

  return (
    <Link href={loginUrl}>登录</Link>
  )
}
