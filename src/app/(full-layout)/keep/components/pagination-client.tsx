'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PaginationList } from '@/app/(full-layout)/keep/components/pagination-list'

interface KeepPaginationClientProps {
  category?: string
  initialPage: number
}

export function KeepPaginationClient({ category, initialPage }: KeepPaginationClientProps) {
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
    const newUrl = queryString ? `/keep?${queryString}` : '/keep'

    router.push(newUrl)
  }

  return (
    <PaginationList
      category={category}
      page={initialPage}
      onPageChange={handlePageChange}
    />
  )
}
