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
        'bg-white/10 backdrop-blur-lg rounded-xl px-5 py-4 border border-white/20 cursor-pointer',
        {
          'transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]': hoverable,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
