'use client'

import { AnimatePresence } from 'framer-motion'
import { Empty } from '@/components/layout/Empty'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { MomentItem } from './item'

interface Props {
  category?: string
}

export function MomentList({ category }: Props) {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = api.moment.fetchByCursor.useInfiniteQuery(
    {
      category,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  if (isLoading)
    return <LoadingSpinner text="加载动态..." />

  if (!data?.pages[0]?.items.length)
    return <Empty title="暂无动态" />

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      loading={isFetchingNextPage}
      error={!!error}
    >
      <div className="flex gap-4 flex-col">
        <AnimatePresence mode="popLayout">
          {data.pages.map(page =>
            page.items.map(moment => (
              <MomentItem key={moment.id} moment={moment} />
            )),
          )}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  )
}
