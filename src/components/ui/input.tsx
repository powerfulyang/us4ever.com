/**
 * Input 组件
 * 提供统一的输入框样式和功能
 */

import type { InputHTMLAttributes } from 'react'
import React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  errorText?: string
}

export function Input({ ref, className, variant = 'default', inputSize = 'md', error = false, leftIcon, rightIcon, helperText, errorText, disabled, type, ...props }: InputProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  const baseStyles = [
    'w-full',
    'rounded-lg',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-gray-400',
    'bg-white/10 backdrop-blur-lg',
    'text-white',
    'border border-white/20',
    'focus:border-purple-500/50 focus:outline-none',
    'resize-none',
  ]

  const variants = {
    default: [
      // 基础样式已包含主题，这里可以留空或为特定变体添加覆盖
    ],
    filled: [
      'border-0 bg-gray-100/10',
      'focus:bg-white/20',
      error && 'bg-red-50/10',
    ],
    outline: [
      'border-2 border-white/20',
      'focus:border-purple-500/50',
      error && 'border-red-500',
    ],
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-5 py-3 text-lg h-12',
  }

  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[inputSize],
            {
              'pl-10': leftIcon,
              'pr-10': rightIcon,
            },
            className,
          )}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {(helperText || errorText) && (
        <p className={cn(
          'mt-1 text-sm',
          error || errorText ? 'text-red-600' : 'text-gray-500',
        )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  )
}

Input.displayName = 'Input'
