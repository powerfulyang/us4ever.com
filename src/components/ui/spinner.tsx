/**
 * Spinner 组件
 * 提供统一的加载动画
 */

import { cn } from '@/utils/cn'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colors = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    white: 'text-white',
    gray: 'text-gray-400',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizes[size],
        colors[color],
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// 带文本的加载组件
export interface LoadingProps extends SpinnerProps {
  text?: string
  vertical?: boolean
}

export function Loading({
  text = '加载中...',
  vertical = false,
  ...spinnerProps
}: LoadingProps) {
  return (
    <div className={cn(
      'flex items-center gap-2',
      vertical && 'flex-col',
    )}
    >
      <Spinner {...spinnerProps} />
      {text && (
        <span className="text-sm text-gray-600">
          {text}
        </span>
      )}
    </div>
  )
}

// 全屏加载组件
export interface FullScreenLoadingProps extends LoadingProps {
  backdrop?: boolean
}

export function FullScreenLoading({
  backdrop = true,
  ...loadingProps
}: FullScreenLoadingProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      backdrop && 'bg-black/20 backdrop-blur-sm',
    )}
    >
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <Loading vertical {...loadingProps} />
      </div>
    </div>
  )
}
