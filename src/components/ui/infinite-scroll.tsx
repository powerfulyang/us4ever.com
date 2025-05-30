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
}

/**
 * 无限滚动组件
 * 使用 usehooks-ts 的 useIntersectionObserver 实现滚动加载
 */
export function InfiniteScroll({
  loading = false,
  hasMore = true,
  onLoadMore,
  className,
  children,
  loadingComponent,
  noMoreComponent,
}: InfiniteScrollProps) {
  const ref = useRef(null!)
  const isIntersecting = useInView(ref, {
    margin: '400px',
  })

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore()
    }
  }, [isIntersecting, hasMore, loading, onLoadMore])

  return (
    <div className={cn('relative', className)}>
      {children}
      <div ref={ref}>
        {loading && (loadingComponent || <div className="py-4 text-center text-gray-100 animate-pulse">加载中...</div>)}
        {!hasMore && !loading && (noMoreComponent || <div className="py-4 text-center text-gray-100">没有更多数据了</div>)}
      </div>
    </div>
  )
}
