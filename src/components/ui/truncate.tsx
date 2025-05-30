'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils'

interface TruncateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string
  /**
   * 是否启用 tooltip，默认为 true
   */
  tooltip?: boolean
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
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
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
            initial={{ opacity: 0, y: placement === 'top' ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement === 'top' ? 8 : -8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-100% sm:w-max',
              'absolute left-0 z-50 px-2 py-1 text-sm bg-black/80 backdrop-blur-sm text-white rounded-lg break-all',
              placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
              tooltipClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
