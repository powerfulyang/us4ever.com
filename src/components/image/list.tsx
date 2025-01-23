'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { ImageCard } from './image-card'

export function ImageList() {
  const { data: images, isPending } = api.asset.list_image.useQuery()

  if (isPending) {
    return <LoadingSpinner text="正在加载图片..." />
  }

  if (!images?.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-1 py-32">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          暂无图片
        </h3>
      </div>
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
