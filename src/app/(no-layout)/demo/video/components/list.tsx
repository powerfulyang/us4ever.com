'use client'

import { Film } from 'lucide-react'
import { useState } from 'react'
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
      <div className="flex flex-col items-center justify-center py-20">
        {/* 空的糖果展示 */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 flex items-center justify-center shadow-xl shadow-rose-200/30 dark:shadow-rose-900/20">
            <Film className="w-14 h-14 text-rose-300 dark:text-rose-600" />
          </div>
          {/* 装饰糖果 */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-300/60 animate-bounce" />
          <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-amber-200/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          暂无视频
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          上传一个视频开始体验
        </p>
      </div>
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
        {/* 视频数量标签 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 text-sm font-semibold text-pink-600 dark:text-pink-400 shadow-sm">
            {allVideos.length} 个视频
          </div>
        </div>

        {/* 视频网格 - 马卡龙风格 */}
        <div className="grid grid-cols-3 gap-5 p-2">
          {allVideos.map(video => (
            <div
              key={video.id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
            >
              <VideoPlayer
                video={video}
                onDelete={() => handleDelete(video.id)}
              />
              {/* 悬浮时的装饰光晕 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-300/20 via-transparent to-rose-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
