'use client'

import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/trpc/react'
import { MomentItem } from './item'

interface PaginationListProps {
  category?: string
  page?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE = 6

export function MomentPaginationList({ category, page = 1, onPageChange }: PaginationListProps) {
  const currentPage = page

  const { data, isLoading, error } = api.moment.fetchByPage.useQuery({
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
    return <LoadingSpinner text="加载动态..." />
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
    return <Empty title="暂无动态" />
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col">
        <AnimatePresence mode="popLayout">
          {data.items.map(moment => (
            <motion.div
              key={moment.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <MomentItem moment={moment} />
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
