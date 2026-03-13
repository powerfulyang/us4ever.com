'use client'

import { useState } from 'react'
import { Empty } from '@/components/layout/Empty'
import { Confirm } from '@/components/ui/confirm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/trpc/react'
import { ImageCard } from './image-card'

interface PaginationListProps {
  category?: string
  page?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE = 6

export function ImagePaginationList({ category, page = 1, onPageChange }: PaginationListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const utils = api.useUtils()
  const deleteImageMutation = api.asset.deleteImage.useMutation({
    onSuccess: () => {
      void utils.asset.fetchImagesByPage.invalidate()
      setIsConfirmOpen(false)
    },
  })

  const currentPage = page

  const { data, isLoading, error } = api.asset.fetchImagesByPage.useQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    category,
  }, {
    staleTime: 5 * 60 * 1000,
  })

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="正在加载图片..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          加载失败：
          {error.message}
        </p>
        <button
          onClick={() => handlePageChange(currentPage)}
          className="text-primary hover:underline"
        >
          重试
        </button>
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return <Empty title="还没有任何图片" />
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map(image => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={() => handleDelete(image.id)}
            />
          ))}
        </div>

        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </div>

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
