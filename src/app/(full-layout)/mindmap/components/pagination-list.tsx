'use client'

import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { MindMapCard } from '@/app/(full-layout)/mindmap/components/mindmap-card'
import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/trpc/react'

interface PaginationListProps {
  page?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE = 6

export function MindMapPaginationList({ page = 1, onPageChange }: PaginationListProps) {
  const currentPage = page

  const { data, isLoading, error } = api.mindMap.fetchByPage.useQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
  }, {
    staleTime: 5 * 60 * 1000,
  })

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="正在获取思维导图..." />
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
    return <Empty title="暂无思维导图" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {data.items.map(mindMap => (
            <motion.div
              key={mindMap.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <MindMapCard
                mindmap={mindMap}
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
