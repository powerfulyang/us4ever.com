'use client'

import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/trpc/react'
import { TodoItem } from './TodoItem'

interface PaginationListProps {
  page?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE = 6

export function TodoPaginationList({ page = 1, onPageChange }: PaginationListProps) {
  const currentPage = page

  const { data, isLoading, error } = api.todo.fetchByPage.useQuery({
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
    return <LoadingSpinner text="加载中..." />
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
    return <Empty title="暂无待办事项" />
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col">
        <AnimatePresence mode="popLayout">
          {data.items.map(todo => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <TodoItem todo={todo} />
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
