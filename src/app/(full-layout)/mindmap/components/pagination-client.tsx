'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { MindMapPaginationList } from '@/app/(full-layout)/mindmap/components/pagination-list'

interface MindMapPaginationClientProps {
  initialPage: number
}

export function MindMapPaginationClient({ initialPage }: MindMapPaginationClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newPage > 1) {
      params.set('page', newPage.toString())
    }
    else {
      params.delete('page')
    }

    const queryString = params.toString()
    const newUrl = queryString ? `/mindmap?${queryString}` : '/mindmap'

    router.push(newUrl)
  }

  return (
    <MindMapPaginationList
      page={initialPage}
      onPageChange={handlePageChange}
    />
  )
}
