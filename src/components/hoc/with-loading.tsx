/**
 * 加载状态高阶组件
 * 提供统一的加载状态处理
 */

import type { ComponentType } from 'react'
import React from 'react'
import { Loading } from '@/components/ui/spinner'
import { cn } from '@/utils/cn'

// 加载状态类型
export interface LoadingState {
  isLoading: boolean
  loadingText?: string
  error?: Error | null
}

// 加载组件属性
export interface LoadingComponentProps {
  isLoading: boolean
  loadingText?: string
  error?: Error | null
  className?: string
}

// 默认加载组件
export function DefaultLoadingComponent({
  isLoading,
  loadingText = '加载中...',
  error,
  className,
}: LoadingComponentProps) {
  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <p className="text-red-600 mb-2">加载失败</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loading text={loadingText} />
      </div>
    )
  }

  return null
}

// 骨架屏加载组件
export function SkeletonLoadingComponent({
  isLoading,
  className,
}: LoadingComponentProps) {
  if (!isLoading)
    return null

  return (
    <div className={cn('animate-pulse space-y-4 p-4', className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  )
}

// 卡片骨架屏
export function CardSkeletonComponent({
  isLoading,
  className,
}: LoadingComponentProps) {
  if (!isLoading)
    return null

  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  )
}

// 列表骨架屏
export function ListSkeletonComponent({
  isLoading,
  count = 3,
  className,
}: LoadingComponentProps & { count?: number }) {
  if (!isLoading)
    return null

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map(_ => (
        <div key={`list-skeleton-${_}`} className="animate-pulse flex items-center space-x-4 p-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 高阶组件选项
export interface WithLoadingOptions {
  LoadingComponent?: ComponentType<LoadingComponentProps>
  loadingProps?: Partial<LoadingComponentProps>
  showLoadingOn?: (props: any) => boolean
}

// 高阶组件：为组件添加加载状态
export function WithLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingOptions = {},
) {
  const {
    LoadingComponent = DefaultLoadingComponent,
    loadingProps = {},
    showLoadingOn = (props: any) => props.isLoading,
  } = options

  const WithLoadingComponent = (props: P) => {
    const shouldShowLoading = showLoadingOn(props)

    if (shouldShowLoading) {
      return (
        <LoadingComponent
          isLoading={true}
          {...loadingProps}
          {...(props as any)}
        />
      )
    }

    return <WrappedComponent {...props} />
  }

  WithLoadingComponent.displayName = `WithLoading(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithLoadingComponent
}

// 组合高阶组件：同时添加错误边界和加载状态
export function WithLoadingAndErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingOptions & {
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  } = {},
) {
  const { onError, ...loadingOptions } = options

  // 先应用加载状态，再应用错误边界
  const ComponentWithLoading = WithLoading(WrappedComponent, loadingOptions)

  // 动态导入错误边界组件以避免循环依赖
  const ComponentWithErrorBoundary = React.lazy(async () => {
    const { WithErrorBoundary } = await import('./with-error-boundary')
    return {
      default: WithErrorBoundary(ComponentWithLoading, { onError }),
    }
  })

  const FinalComponent = (props: P) => (
    <React.Suspense fallback={<DefaultLoadingComponent isLoading={true} />}>
      <ComponentWithErrorBoundary {...props} />
    </React.Suspense>
  )

  FinalComponent.displayName = `WithLoadingAndErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return FinalComponent
}
