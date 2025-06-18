/**
 * Alert 组件
 * 提供统一的警告和提示信息展示
 */

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react'
import React from 'react'
import { cn } from '@/utils/cn'

export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: ReactNode
  closable?: boolean
  onClose?: () => void
  className?: string
  icon?: ReactNode | boolean
}

export function Alert({
  variant = 'info',
  title,
  children,
  closable = false,
  onClose,
  className,
  icon = true,
}: AlertProps) {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-400',
      title: 'text-green-800',
      IconComponent: CheckCircle,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      title: 'text-red-800',
      IconComponent: AlertCircle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      IconComponent: AlertTriangle,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      IconComponent: Info,
    },
  }

  const config = variants[variant]
  const IconComponent = config.IconComponent

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative rounded-md border p-4',
        config.container,
        className,
      )}
    >
      <div className="flex">
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0">
            {icon === true
              ? (
                  <IconComponent className={cn('h-5 w-5', config.icon)} />
                )
              : (
                  icon
                )}
          </div>
        )}

        {/* Content */}
        <div className={cn('ml-3 flex-1', !icon && 'ml-0')}>
          {title && (
            <h3 className={cn('text-sm font-medium', config.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title && 'mt-1')}>
            {children}
          </div>
        </div>

        {/* Close button */}
        {closable && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'hover:bg-black/5 transition-colors',
                  config.icon,
                  'focus:ring-offset-2 focus:ring-current',
                )}
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// 可关闭的 Alert 组件
export interface DismissibleAlertProps extends Omit<AlertProps, 'closable' | 'onClose'> {
  isVisible: boolean
  onDismiss: () => void
}

export function DismissibleAlert({
  isVisible,
  onDismiss,
  ...alertProps
}: DismissibleAlertProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <Alert
          {...alertProps}
          closable
          onClose={onDismiss}
        />
      )}
    </AnimatePresence>
  )
}

// 自动消失的 Alert 组件
export interface AutoDismissAlertProps extends DismissibleAlertProps {
  duration?: number // 毫秒
}

export function AutoDismissAlert({
  duration = 5000,
  onDismiss,
  ...alertProps
}: AutoDismissAlertProps) {
  // 自动消失逻辑
  React.useEffect(() => {
    if (!alertProps.isVisible)
      return

    const timer = setTimeout(() => {
      onDismiss()
    }, duration)

    return () => clearTimeout(timer)
  }, [alertProps.isVisible, duration, onDismiss])

  return <DismissibleAlert {...alertProps} onDismiss={onDismiss} />
}

// Alert 列表容器
export interface AlertListProps {
  alerts: Array<{
    id: string
    variant?: AlertProps['variant']
    title?: string
    message: string
    duration?: number
  }>
  onDismiss: (id: string) => void
  className?: string
}

export function AlertList({ alerts, onDismiss, className }: AlertListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
          >
            <AutoDismissAlert
              isVisible={true}
              variant={alert.variant}
              title={alert.title}
              duration={alert.duration}
              onDismiss={() => onDismiss(alert.id)}
            >
              {alert.message}
            </AutoDismissAlert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
