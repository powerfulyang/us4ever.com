'use client'

import * as React from 'react'
import { cn } from '@/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checkedLabel?: string
  uncheckedLabel?: string
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({
  checkedLabel = '公开',
  uncheckedLabel = '私密',
  checked,
  className,
  onCheckedChange,
  ...props
}: SwitchProps) {
  return (
    <label className={cn('relative inline-flex items-center cursor-pointer', className)}>
      <input
        type="checkbox"
        className="sr-only peer"
        {...props}
        checked={checked}
        onChange={e => onCheckedChange?.(e.target.checked)}
      />
      <div
        className={cn(
          'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300',
          'rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full',
          'peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px]',
          'after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full',
          'after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r',
          'peer-checked:from-pink-500 peer-checked:via-purple-500 peer-checked:to-indigo-500',
        )}
      />
      <span className="ms-3 text-sm font-medium text-gray-300">
        {checked ? checkedLabel : uncheckedLabel}
      </span>
    </label>
  )
}
