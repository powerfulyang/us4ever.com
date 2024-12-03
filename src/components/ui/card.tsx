import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
}

export function Card({
  children,
  className,
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-6 border border-white/20',
        {
          'hover:border-purple-500/50 transition-all duration-300': hoverable,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
