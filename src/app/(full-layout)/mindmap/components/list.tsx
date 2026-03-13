'use client'

import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { MindMapCard } from '@/app/(full-layout)/mindmap/components/mindmap-card'
import { Empty } from '@/components/layout/Empty'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

export function MindMapList() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = api.mindMap.fetchByCursor.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  if (isLoading) {
    return <LoadingSpinner text="正在获取思维导图..." />
  }

  if (!data?.pages[0]?.items.length) {
    return (
      <Empty title="暂无思维导图" />
    )
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      loading={isFetchingNextPage}
      error={!!error}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {data.pages.map(page =>
            page.items.map(mindMap => (
              <motion.div
                key={mindMap.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <MindMapCard mindmap={mindMap} />
              </motion.div>
            )),
          )}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  )
}
