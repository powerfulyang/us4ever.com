'use client'

import type { Image } from '@/server/api/routers/asset'
import { Info, Lock, Trash2, Unlock } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
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
    { url: image.thumbnail_10x_url, label: '模糊', size: image.thumbnail_10x_size },
    { url: image.thumbnail_320x_url, label: '小', size: image.thumbnail_320x_size },
    { url: image.thumbnail_768x_url, label: '中', size: image.thumbnail_768x_size },
    { url: image.compressed_url, label: '压缩', size: image.compressed_size },
    { url: image.original_url, label: '原图', size: image.original_size },
  ]

  const selected_size = thumbnails.find(thumbnail => thumbnail.url === selectedUrl)?.size || 0
  const is_10x = selectedUrl === image.thumbnail_10x_url

  return (
    <>
      <Card hoverable className="p-2 group">
        <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-secondary">
          <img
            src={selectedUrl}
            alt={image.name}
            className={cn('object-cover w-full h-full group-hover:scale-105 transition-transform duration-300', {
              'blur-[32px]': is_10x,
            })}
          />
          {/* 状态指示器 */}
          <div className="absolute top-2 left-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-md">
            {image.isPublic
              ? <Unlock className="w-4 h-4 text-primary" />
              : <Lock className="w-4 h-4 text-muted-foreground" />}
          </div>
          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 text-foreground transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="text-sm font-medium truncate mb-1">
              {image.name}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                原图:
                {' '}
                {formatFileSize(image.original_size)}
              </span>
              <span>
                已选:
                {' '}
                {formatFileSize(selected_size)}
              </span>
            </div>
          </div>
          {/* 操作按钮 */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => setShowExif(true)}
              className="p-1.5 bg-background/80 backdrop-blur-sm rounded-md hover:bg-background transition-colors"
            >
              <Info className="w-4 h-4 text-foreground" />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 bg-background/80 backdrop-blur-sm rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {/* 缩略图选择 */}
        <div className="grid grid-cols-5 gap-1 pt-2">
          {thumbnails.map(thumb => (
            <button
              type="button"
              key={thumb.label}
              onClick={() => setSelectedUrl(thumb.url)}
              className={cn(
                'relative group/thumb aspect-square rounded overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors',
                {
                  'border-primary': selectedUrl === thumb.url,
                },
              )}
            >
              <img
                src={image.thumbnail_320x_url}
                alt={thumb.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-foreground font-medium">{thumb.label}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <ImageInfoModal
        image={image}
        isOpen={showExif}
        onCloseAction={() => setShowExif(false)}
      />
    </>
  )
}
