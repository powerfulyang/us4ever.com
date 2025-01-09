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
      <div className="flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center my-6">
          <svg className="w-12 h-12 text-purple-400 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          暂无图片
        </h3>
        <p className="mt-4 text-gray-400 text-center max-w-md leading-relaxed">
          上传一些图片开始使用吧
        </p>
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
