import React from 'react'

// Hook：管理加载状态
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [error, setError] = React.useState<Error | null>(null)

  const startLoading = React.useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const setLoadingError = React.useCallback((error: Error) => {
    setIsLoading(false)
    setError(error)
  }, [])

  const reset = React.useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
  }
}

// Hook：异步操作加载状态
export function useAsyncLoading<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
) {
  const { isLoading, error, startLoading, stopLoading, setLoadingError }
    = useLoading()

  const execute = React.useCallback(
    async (...args: Parameters<T>) => {
      try {
        startLoading()
        const result = await asyncFn(...args)
        stopLoading()
        return result
      }
      catch (err) {
        setLoadingError(err instanceof Error ? err : new Error(String(err)))
        throw err
      }
    },
    [asyncFn, startLoading, stopLoading, setLoadingError],
  )

  return {
    execute,
    isLoading,
    error,
  }
}
