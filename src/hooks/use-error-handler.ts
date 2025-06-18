import React from 'react'

// Hook：在函数组件中使用错误边界
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  // 如果有错误，抛出它以便错误边界捕获
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// 异步错误处理 Hook
export function useAsyncError() {
  const { captureError } = useErrorHandler()

  return React.useCallback(
    (error: Error) => {
      // 在下一个事件循环中抛出错误
      setTimeout(() => {
        captureError(error)
      }, 0)
    },
    [captureError],
  )
}
