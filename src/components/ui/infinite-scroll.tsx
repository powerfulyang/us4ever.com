import { useInView } from 'framer-motion'
import React, { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * 无限滚动组件的属性接口
 */
export interface InfiniteScrollProps {
  /** 是否正在加载更多数据 */
  loading?: boolean
  /** 是否还有更多数据 */
  hasMore?: boolean
  /** 是否加载失败 */
  error?: boolean
  /** 加载更多数据的回调函数 */
  onLoadMore: () => void
  /** 自定义类名 */
  className?: string
  /** 子元素 */
  children: React.ReactNode
  /** 加载提示组件 */
  loadingComponent?: React.ReactNode
  /** 没有更多数据的提示组件 */
  noMoreComponent?: React.ReactNode
  /** 加载失败的提示组件 */
  errorComponent?: React.ReactNode
}

/**
 * 无限滚动组件
 */
export function InfiniteScroll({
  loading = false,
  hasMore = true,
  onLoadMore,
  className,
  children,
  loadingComponent,
  noMoreComponent,
  error = false,
  errorComponent,
}: InfiniteScrollProps) {
  const ref = useRef(null!)
  const isIntersecting = useInView(ref, {
    margin: '400px',
  })

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && !error) {
      onLoadMore()
    }
  }, [isIntersecting, hasMore, loading, onLoadMore, error])

  return (
    <div className={cn('relative', className)}>
      {children}
      <div ref={ref}>
        {loading && (loadingComponent || <div className="py-4 text-center text-gray-100 animate-pulse">加载中...</div>)}
        {error
          && !loading
          && (errorComponent || (
            <div className="py-4 text-center text-gray-100">
              加载失败，
              <button type="button" onClick={() => onLoadMore()} className="text-blue-500 hover:underline">
                点击重试
              </button>
            </div>
          ))}
        {!hasMore && !loading && !error && (noMoreComponent || <div className="py-4 text-center text-gray-100">没有更多数据了</div>)}
      </div>
    </div>
  )
}
