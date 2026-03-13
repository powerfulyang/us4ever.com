'use client'

import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { KeepCard } from '@/app/(full-layout)/keep/components/keep-card'
import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/trpc/react'

interface PaginationListProps {
  category?: string
  page?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE = 10

export function PaginationList({ category, page = 1, onPageChange }: PaginationListProps) {
  const [currentPage, setCurrentPage] = React.useState(page)

  // 当外部 page 变化时同步
  React.useEffect(() => {
    setCurrentPage(page)
  }, [page])

  const { data, isLoading, error } = api.keep.fetchByPage.useQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    category,
  }, {
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="正在获取笔记..." />
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
    return <Empty title="暂无笔记" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {data.items.map(keep => (
            <motion.div
              key={keep.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <KeepCard
                keep={keep}
                onDelete={() => handlePageChange(currentPage)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Pagination
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
