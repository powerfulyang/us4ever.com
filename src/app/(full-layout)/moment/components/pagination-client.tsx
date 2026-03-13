'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { MomentPaginationList } from '@/app/(full-layout)/moment/components/pagination-list'

interface MomentPaginationClientProps {
  category?: string
  initialPage: number
}

export function MomentPaginationClient({ category, initialPage }: MomentPaginationClientProps) {
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
    const newUrl = queryString ? `/moment?${queryString}` : '/moment'

    router.push(newUrl)
  }

  return (
    <MomentPaginationList
      category={category}
      page={initialPage}
      onPageChange={handlePageChange}
    />
  )
}
