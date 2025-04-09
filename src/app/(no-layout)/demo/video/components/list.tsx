'use client'

import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

export function VideoList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = api.asset.infinite_video_list.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  const allVideos = data?.pages.flatMap(page => page.items) ?? []

  if (isPending) {
    return <LoadingSpinner text="正在获取视频..." />
  }

  if (!allVideos.length && !isPending) {
    return <div>没有找到视频</div>
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      loading={isFetchingNextPage}
      hasMore={hasNextPage}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-y border-gray-200"
      >
        {allVideos.map(video => (
          <div key={video.id} className="aspect-video">
            <video controls src={video.file_url} className="w-full h-full object-cover rounded-lg" />
          </div>
        ))}
      </div>
    </InfiniteScroll>
  )
}
