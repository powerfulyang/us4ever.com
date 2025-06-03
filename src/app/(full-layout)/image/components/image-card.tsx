'use client'

import type { Image } from '@/server/api/routers/asset'
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
              ? (
                  <svg
                    className="w-5 h-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M10.5 16a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0" />
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M9.81 4.005a3.2 3.2 0 0 1 4.164 1.808l.075.192q.14.359.198.738l.217 1.423l1.483-.226l-.217-1.423a5 5 0 0 0-.283-1.057l-.075-.193a4.7 4.7 0 0 0-9.024 2.418l.03.204q.084.545.284 1.058l.655 1.675l-.382.03a2.36 2.36 0 0 0-2.142 1.972a20.9 20.9 0 0 0 0 6.752a2.36 2.36 0 0 0 2.142 1.972l1.496.12c2.376.19 4.762.19 7.138 0l1.496-.12a2.36 2.36 0 0 0 2.142-1.972a20.9 20.9 0 0 0 0-6.752a2.36 2.36 0 0 0-2.142-1.972l-1.496-.12a45 45 0 0 0-6.69-.033l-.82-2.098a3.5 3.5 0 0 1-.197-.738L7.83 7.46a3.2 3.2 0 0 1 1.98-3.455m5.64 8.023a43.4 43.4 0 0 0-6.9 0l-1.496.12a.86.86 0 0 0-.781.719a19.4 19.4 0 0 0 0 6.266a.86.86 0 0 0 .781.72l1.497.12c2.296.183 4.602.183 6.898 0l1.496-.12a.86.86 0 0 0 .782-.72a19.4 19.4 0 0 0 0-6.266a.86.86 0 0 0-.782-.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              : (
                  <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M10.5 16a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0" />
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="m7.622 10.597l-.316-2.839a5 5 0 0 1 0-1.095l.023-.205a4.7 4.7 0 0 1 9.342 0l.023.205q.06.547 0 1.095l-.316 2.84l.687.054a2.36 2.36 0 0 1 2.142 1.972a20.9 20.9 0 0 1 0 6.752a2.36 2.36 0 0 1-2.142 1.972l-1.496.12c-2.376.19-4.762.19-7.138 0l-1.496-.12a2.36 2.36 0 0 1-2.142-1.972a20.9 20.9 0 0 1 0-6.752a2.36 2.36 0 0 1 2.142-1.972zM11.626 3.8a3.2 3.2 0 0 1 3.554 2.825l.023.205q.042.381 0 .764l-.321 2.89a45 45 0 0 0-5.764 0l-.32-2.89a3.5 3.5 0 0 1 0-.764l.022-.205A3.2 3.2 0 0 1 11.626 3.8m3.824 8.229a43.4 43.4 0 0 0-6.9 0l-1.495.12a.86.86 0 0 0-.782.719a19.4 19.4 0 0 0 0 6.266a.86.86 0 0 0 .782.72l1.496.12c2.296.183 4.602.183 6.899 0l1.496-.12a.86.86 0 0 0 .781-.72a19.4 19.4 0 0 0 0-6.266a.86.86 0 0 0-.781-.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
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
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 bg-black/60 rounded-lg hover:bg-black/80"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-0.5 overflow-x-auto pt-2">
          {thumbnails.map(thumb => (
            <button
              type="button"
              key={thumb.url}
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
