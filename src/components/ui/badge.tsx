import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'default'
}

export function Badge({
  children,
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    default: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <span
      className={cn(
        'px-2 py-1 rounded-full text-xs',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
