'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'

/**
 * 检查浏览器是否支持 View Transitions API
 */
function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // 使用 requestAnimationFrame 避免直接在 useEffect 中调用 setState
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    // 在 light 和 dark 之间切换
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

    // 如果不支持 View Transitions API，直接切换
    if (!supportsViewTransitions()) {
      setTheme(newTheme)
      return
    }

    const { clientX: x, clientY: y } = e
    // 计算从点击位置到屏幕最远角的距离
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    // 判断当前是亮色还是暗色
    const isNowDark = document.documentElement.classList.contains('dark')
    // 如果当前是暗色，切换到亮色就是扩散效果；反之是收缩效果
    const isExpanding = isNowDark

    // 设置过渡方向标记
    document.documentElement.dataset.transitionDirection = isExpanding
      ? 'expand'
      : 'shrink'

    // 使用 View Transitions API
    const transition = (document as any).startViewTransition(() => {
      // flushSync 在这里是必需的，因为 View Transitions 需要同步更新 DOM
      // eslint-disable-next-line react-dom/no-flush-sync
      flushSync(() => {
        setTheme(newTheme)
      })
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: isExpanding ? clipPath : clipPath.reverse(),
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards' as FillMode,
          pseudoElement: isExpanding
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      )
    })

    transition.finished.finally(() => {
      delete document.documentElement.dataset.transitionDirection
    })
  }

  // SSR 时渲染占位符（带图标避免闪烁）
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Sun className="h-4 w-4" />
        <span className="sr-only">切换主题</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 relative overflow-hidden group"
      onClick={handleClick}
    >
      {/* 太阳图标 - 亮色模式显示 */}
      <Sun
        className={`
          h-4 w-4 absolute transition-all duration-300 ease-out
          ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          group-hover:scale-110 group-hover:rotate-12
        `}
      />
      {/* 月亮图标 - 暗色模式显示 */}
      <Moon
        className={`
          h-4 w-4 absolute transition-all duration-300 ease-out
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          group-hover:scale-110 group-hover:-rotate-12
        `}
      />
      {/* Hover 光晕效果 */}
      <span
        className={`
          absolute inset-0 rounded-md transition-opacity duration-300
          ${isDark ? 'bg-amber-500/10' : 'bg-blue-500/10'}
          opacity-0 group-hover:opacity-100
        `}
      />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
