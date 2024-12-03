import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'
import React from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({ ref, children, className, variant = 'default', size = 'sm', isLoading, disabled, leftIcon, rightIcon, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement> }) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none'

  const variants = {
    default: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105',
    outline: 'border border-purple-500 text-purple-500 hover:bg-purple-500/10',
    ghost: 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10',
  }

  const sizes = {
    xs: 'text-xs px-2 py-1 rounded-md',
    sm: 'text-sm px-4 py-1.5 rounded-lg',
    md: 'px-6 py-2 rounded-lg',
    lg: 'text-lg px-8 py-3 rounded-xl',
  }

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}

Button.displayName = 'Button'
