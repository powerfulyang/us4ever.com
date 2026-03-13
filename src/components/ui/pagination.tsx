'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = React.useState('')

  // 计算显示的页码范围（最多显示5个页码）
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    }
    else {
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleJump = () => {
    const page = Number.parseInt(jumpPage, 10)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpPage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump()
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap', className)}>
      {/* 统计信息 */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        共
        {' '}
        {total}
        {' '}
        条，每页
        {' '}
        {pageSize}
        {' '}
        条，共
        {' '}
        {totalPages}
        {' '}
        页
      </div>

      {/* 分页控制 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
        {/* 首页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          title="首页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 上一页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 页码按钮 */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={`${page}-${index}`}>
            {page === '...'
              ? (
                  <span className="px-2 text-muted-foreground">...</span>
                )
              : (
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 min-w-[32px] px-2"
                    onClick={() => onPageChange(page as number)}
                  >
                    {page}
                  </Button>
                )}
          </React.Fragment>
        ))}

        {/* 下一页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 末页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="末页"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        {/* 跳转输入框 */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">跳至</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={e => setJumpPage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-16 text-center"
            placeholder="页"
          />
          <span className="text-sm text-muted-foreground">页</span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleJump}
            disabled={!jumpPage || Number.parseInt(jumpPage, 10) < 1 || Number.parseInt(jumpPage, 10) > totalPages}
          >
            跳转
          </Button>
        </div>
      </div>
    </div>
  )
}
