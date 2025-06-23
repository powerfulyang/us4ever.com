'use client'

import { useState } from 'react'
import { Empty } from '@/components/layout/Empty'
import { Confirm } from '@/components/ui/confirm'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { ImageCard } from './image-card'

interface ImageListProps {
  category?: string
}

export function ImageList({ category }: ImageListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const utils = api.useUtils()
  const deleteImageMutation = api.asset.deleteImage.useMutation({
    onSuccess: () => {
      void utils.asset.fetchImagesByCursor.invalidate()
      setIsConfirmOpen(false)
    },
  })

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = api.asset.fetchImagesByCursor.useInfiniteQuery(
    { category },
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

  function handleDelete(id: string) {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  function confirmDelete() {
    if (!deleteId)
      return
    deleteImageMutation.mutate({ id: deleteId })
  }

  return (
    <>
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
                onDelete={() => handleDelete(image.id)}
              />
            )),
          )}
        </div>
      </InfiniteScroll>

      <Confirm
        isOpen={isConfirmOpen}
        onCloseAction={() => setIsConfirmOpen(false)}
        onConfirmAction={confirmDelete}
        isConfirmLoading={deleteImageMutation.isPending}
        title="删除图片"
        content="确定要删除这张图片吗？此操作不可撤销。"
      />
    </>
  )
}
