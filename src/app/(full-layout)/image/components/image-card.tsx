'use client'

import type { Image } from '@/server/api/routers/asset'
import { Info, Lock, Trash2, Unlock } from 'lucide-react'
import { useState } from 'react'
import { cn, formatFileSize } from '@/utils'
import { ImageInfoModal } from './image-info-modal'

interface Thumbnail {
  url: string
  label: string
  size: bigint | number
}

interface ImageCardProps {
  image: Image
  onDelete?: () => void
}

export function ImageCard({ image, onDelete }: ImageCardProps) {
  const [selectedUrl, setSelectedUrl] = useState(image.thumbnail_320x_url)
  const [showExif, setShowExif] = useState(false)

  const thumbnails: Thumbnail[] = [
    { url: image.thumbnail_10x_url, label: '模糊图', size: image.thumbnail_10x_size },
    { url: image.thumbnail_320x_url, label: 'Portrait', size: image.thumbnail_320x_size },
    { url: image.thumbnail_768x_url, label: 'Landscape', size: image.thumbnail_768x_size },
    { url: image.compressed_url, label: '压缩图', size: image.compressed_size },
    { url: image.original_url, label: '原图', size: image.original_size },
  ]

  const selected_size = thumbnails.find(thumbnail => thumbnail.url === selectedUrl)?.size || 0
  const is_10x = selectedUrl === image.thumbnail_10x_url

  return (
    <>
      <div
        title={image.isPublic ? '公开' : '私密'}
        className="bg-white/10 rounded-xl p-2 border border-white/20 hover:border-purple-500/50 transition-all duration-300 group"
      >
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <img
            src={selectedUrl}
            alt={image.name}
            className={cn('object-cover w-full h-full group-hover:scale-105 transition-transform duration-300', {
              'blur-[32px]': is_10x,
            })}
          />
          <div className="absolute top-2 left-2 p-2 bg-black/60 rounded-lg hover:bg-black/80 text-white">
            {image.isPublic
              ? <Unlock className="w-5 h-5 text-white" />
              : <Lock className="w-5 h-5 text-white" />}
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div
            className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <div className="text-sm font-medium truncate mb-1">
              {image.name}
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>
                原图:
                {formatFileSize(image.original_size)}
              </span>
              <span>
                已选:
                {formatFileSize(selected_size)}
              </span>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowExif(true)}
              className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-0.5 overflow-x-auto pt-2">
          {thumbnails.map(thumb => (
            <button
              type="button"
              key={thumb.label}
              onClick={() => setSelectedUrl(thumb.url)}
              className={cn(
                'relative group/thumb border-2 border-transparent rounded',
                {
                  'border-purple-500': selectedUrl === thumb.url,
                },
              )}
            >
              <img
                src={image.thumbnail_320x_url}
                alt={thumb.label}
                className="w-full aspect-square rounded object-cover"
              />
              <div className="absolute inset-0 rounded bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs text-white">{thumb.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ImageInfoModal
        image={image}
        isOpen={showExif}
        onCloseAction={() => setShowExif(false)}
      />
    </>
  )
}
