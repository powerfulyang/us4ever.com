/**
 * 错误边界高阶组件
 * 提供组件级别的错误捕获和处理
 */

import type { ComponentType, ReactNode } from 'react'
import * as React from 'react'
import { Component } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ComponentType<{ error: Error, retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      const { error } = this.state

      if (Fallback && error) {
        return <Fallback error={error} retry={this.handleRetry} />
      }

      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>组件渲染错误</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>抱歉，组件渲染时发生了错误。</p>
                {process.env.NODE_ENV === 'development' && error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      错误详情
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/20 p-2 rounded overflow-auto">
                      {error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleRetry}
                  >
                    重试
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

// 默认错误回退组件
export function DefaultErrorFallback({
  error,
  retry,
}: {
  error: Error
  retry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          出现了一些问题
        </h2>
        <p className="text-muted-foreground mb-4">
          组件加载失败，请稍后重试
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              错误信息
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">
              {error.message}
            </pre>
          </details>
        )}
        <Button onClick={retry} variant="outline">
          重新加载
        </Button>
      </div>
    </div>
  )
}

// 高阶组件：为组件添加错误边界
export function WithErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    fallback?: ComponentType<{ error: Error, retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  } = {},
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary
        fallback={options.fallback || DefaultErrorFallback}
        onError={options.onError}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorBoundaryComponent.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithErrorBoundaryComponent
}

export { ErrorBoundary }
