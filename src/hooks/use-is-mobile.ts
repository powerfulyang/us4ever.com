'use client'

import * as React from 'react'

const MD_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MD_BREAKPOINT)
    }

    // 初始检查
    checkMobile()

    // 监听窗口大小变化
    const mql = window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`)
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
