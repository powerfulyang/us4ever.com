'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { TodoPaginationList } from '@/app/(full-layout)/todo/components/pagination-list'

interface TodoPaginationClientProps {
  initialPage: number
}

export function TodoPaginationClient({ initialPage }: TodoPaginationClientProps) {
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
    const newUrl = queryString ? `/todo?${queryString}` : '/todo'

    router.push(newUrl)
  }

  return (
    <TodoPaginationList
      page={initialPage}
      onPageChange={handlePageChange}
    />
  )
}
