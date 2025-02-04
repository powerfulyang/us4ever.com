'use client'

import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import React from 'react'
import { ImageCard } from './image-card'

export function ImageList() {
  const { data: images, isPending } = api.asset.list_image.useQuery()

  if (isPending) {
    return <LoadingSpinner text="正在加载图片..." />
  }

  if (!images?.length) {
    return (
      <Empty title="还没有任何图片" />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map(image => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  )
}
