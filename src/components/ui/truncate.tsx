'use client'

import { cn } from '@/utils'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'

interface TruncateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string
  /**
   * 是否启用 tooltip，默认为 true
   */
  tooltip?: boolean
  /**
   * tooltip 的最大宽度，默认为 300px
   */
  tooltipMaxWidth?: number
  /**
   * 自定义 tooltip 的类名
   */
  tooltipClassName?: string
  /**
   * tooltip 的位置，默认为 top
   */
  placement?: 'top' | 'bottom'
}

export function Truncate({
  children,
  className,
  tooltip = true,
  tooltipMaxWidth = 300,
  tooltipClassName,
  placement = 'top',
  ...props
}: TruncateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOverflow, setIsOverflow] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element)
      return

    const hasOverflow = element.scrollWidth > element.clientWidth
    setIsOverflow(hasOverflow)
  }, [children])

  return (
    <div className="relative">
      <div
        ref={ref}
        className={cn('truncate', className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        {...props}
      >
        {children}
      </div>

      <AnimatePresence>
        {tooltip && isOverflow && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 8 : -8, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: placement === 'top' ? 8 : -8, x: '-50%' }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute left-1/2 z-50 px-2 py-1 text-sm bg-black/80 backdrop-blur-sm text-white rounded-lg',
              placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
              tooltipClassName,
            )}
            style={{ maxWidth: tooltipMaxWidth }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
