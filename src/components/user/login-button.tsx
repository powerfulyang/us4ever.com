import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LoginButton() {
  const [loginUrl, setLoginUrl] = useState<string>('')

  useEffect(() => {
    const origin = window.location.origin
    const currentPath = window.location.pathname
    const redirect = `${origin}/api/lp?_redirect=${currentPath}`
    const loginUrl = `https://api.littleeleven.com/api/auth/google?_redirect=${encodeURIComponent(redirect)}`
    setLoginUrl(loginUrl)
  }, [])

  return (
    <div className="h-[3rem]">
      <Link href={loginUrl} className="text-white bg-blue-600 px-4 py-2 text-sm rounded leading-[3rem]">
        登录
      </Link>
    </div>
  )
}
