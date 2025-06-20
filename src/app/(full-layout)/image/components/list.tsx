'use client'

import { Empty } from '@/components/layout/Empty'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { ImageCard } from './image-card'

export function ImageList() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = api.asset.fetchImagesByCursor.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  if (isLoading) {
    return <LoadingSpinner text="正在加载图片..." />
  }

  if (!data?.pages[0]?.items.length) {
    return (
      <Empty title="还没有任何图片" />
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
        {data.pages.map(page =>
          page.items.map(image => (
            <ImageCard
              key={image.id}
              image={image}
            />
          )),
        )}
      </div>
    </InfiniteScroll>
  )
}
