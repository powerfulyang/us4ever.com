/**
 * 页面跳转进度条组件
 * 监听路由变化并显示顶部进度条动画
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function PageProgress() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 路由变化时触发加载动画
    setIsLoading(true)
    setProgress(0)

    // 模拟进度增长
    const progressTimer = setTimeout(setProgress, 50, 60)
    const completeTimer = setTimeout(setProgress, 200, 100)

    // 动画完成后隐藏
    const hideTimer = setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 500)

    return () => {
      clearTimeout(progressTimer)
      clearTimeout(completeTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-transparent"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full bg-primary shadow-[0_0_10px_rgba(45,212,191,0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: progress === 100 ? 0.2 : 0.4,
              ease: progress === 100 ? 'easeOut' : 'easeInOut',
            }}
            style={{
              backgroundColor: 'hsl(var(--primary))',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
