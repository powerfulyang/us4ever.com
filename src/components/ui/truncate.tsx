'use client'

import { cn } from '@/utils'
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
}

export function Truncate({
  children,
  className,
  tooltip = true,
  tooltipMaxWidth = 300,
  tooltipClassName,
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
    <div className="relative contents">
      <div
        ref={ref}
        className={cn('truncate', className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        {...props}
      >
        {children}
      </div>

      {tooltip && isOverflow && showTooltip && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-sm bg-black/80 backdrop-blur-sm text-white rounded-lg',
            'animate-in fade-in zoom-in-95 duration-200',
            'top-full mt-1',
            tooltipClassName,
          )}
          style={{ maxWidth: tooltipMaxWidth }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
