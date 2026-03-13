'use client'

import { AnimatePresence } from 'framer-motion'
import { KeepCard } from '@/app/(full-layout)/keep/components/keep-card'
import { Empty } from '@/components/layout/Empty'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

interface KeepListProps {
  category?: string
}

export function KeepList({ category }: KeepListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.keep.fetchByCursor.useInfiniteQuery(
    { category },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  const allKeeps = data?.pages.flatMap(page => page.items) ?? []

  if (isLoading) {
    return <LoadingSpinner text="正在获取笔记..." />
  }

  if (!allKeeps.length && !isLoading) {
    return (
      <Empty title="暂无笔记" />
    )
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      loading={isFetchingNextPage}
      hasMore={hasNextPage}
      error={!!error}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {allKeeps.map(keep => (
            <KeepCard key={keep.id} keep={keep} />
          ))}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  )
}
