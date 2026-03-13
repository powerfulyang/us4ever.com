'use client'

import { Film } from 'lucide-react'
import { useState } from 'react'
import { Empty } from '@/components/layout/Empty'
import { Confirm } from '@/components/ui/confirm'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { VideoPlayer } from './video-player'

export function VideoList() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const utils = api.useUtils()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
  } = api.asset.fetchVideosByCursor.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  const deleteMutation = api.asset.deleteVideo.useMutation({
    onSuccess: () => {
      void utils.asset.fetchVideosByCursor.invalidate()
      setIsConfirmOpen(false)
      setDeleteId(null)
    },
  })

  const allVideos = data?.pages.flatMap(page => page.items) ?? []

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId })
    }
  }

  if (isPending) {
    return <LoadingSpinner text="正在加载视频..." />
  }

  if (!allVideos.length && !isPending) {
    return (
      <Empty
        title="暂无视频"
        description="上传一个视频开始体验"
        icon={<Film className="w-12 h-12 text-muted-foreground/50" />}
      />
    )
  }

  return (
    <>
      <InfiniteScroll
        onLoadMore={fetchNextPage}
        loading={isFetchingNextPage}
        hasMore={hasNextPage}
        error={!!error}
        className="w-full"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 p-2">
          {allVideos.map(video => (
            <div
              key={video.id}
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <VideoPlayer
                video={video}
                onDelete={() => handleDelete(video.id)}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>

      <Confirm
        isOpen={isConfirmOpen}
        onCloseAction={() => setIsConfirmOpen(false)}
        onConfirmAction={confirmDelete}
        isConfirmLoading={deleteMutation.isPending}
        title="删除视频"
        content="确定要删除这个视频吗？此操作不可撤销。"
      />
    </>
  )
}
