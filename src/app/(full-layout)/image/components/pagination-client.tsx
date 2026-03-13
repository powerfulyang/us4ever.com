'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ImagePaginationList } from '@/app/(full-layout)/image/components/pagination-list'

interface ImagePaginationClientProps {
  category?: string
  initialPage: number
}

export function ImagePaginationClient({ category, initialPage }: ImagePaginationClientProps) {
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
    const newUrl = queryString ? `/image?${queryString}` : '/image'

    router.push(newUrl)
  }

  return (
    <ImagePaginationList
      category={category}
      page={initialPage}
      onPageChange={handlePageChange}
    />
  )
}
