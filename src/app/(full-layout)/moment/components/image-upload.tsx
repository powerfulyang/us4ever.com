'use client'

import type { ChangeEvent } from 'react'
import type { Image, Video } from '@/server/api/routers/asset'
import React, { useEffect, useRef, useState } from 'react'
import { AssetImageWithData } from '@/app/(full-layout)/image/components/image'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'

// 媒体类型联合类型
type Media = Image | Video

// 判断是否为视频
function isVideo(media: Media): media is Video {
  return 'duration' in media
}

interface MediaUploadProps {
  medias: Media[]
  onMediaSelectAction: (media: Media) => void
  onMediaRemoveAction: (media: Media) => void
  maxMedias?: number
  className?: string
  category: string
  onUploadingChange?: (isUploading: boolean) => void
}

interface UploadingMedia {
  id: string
  preview: string
  type: 'image' | 'video'
  error?: string
}

export function MediaUpload({
  medias,
  onMediaSelectAction,
  onMediaRemoveAction,
  maxMedias = 9,
  className,
  category,
  onUploadingChange,
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingMedias, setUploadingMedias] = useState<UploadingMedia[]>([])
  const [error, setError] = useState<string>('')

  const { mutate: uploadImage } = api.asset.uploadImage.useMutation({
    onSuccess: (data, variables) => {
      const tempId = (variables as FormData).get('tempId') as string
      if (tempId) {
        setUploadingMedias(prev => prev.filter(media => media.id !== tempId))
      }
      onMediaSelectAction(data)
    },
    onError: (error, variables) => {
      const tempId = (variables as FormData).get('tempId') as string
      if (tempId) {
        setUploadingMedias(prev =>
          prev.map(media =>
            media.id === tempId
              ? { ...media, error: error.message || '上传失败' }
              : media,
          ),
        )
      }
    },
  })

  const { mutate: uploadVideo } = api.asset.uploadVideo.useMutation({
    onSuccess: (data, variables) => {
      const tempId = (variables as FormData).get('tempId') as string
      if (tempId) {
        setUploadingMedias(prev => prev.filter(media => media.id !== tempId))
      }
      onMediaSelectAction(data)
    },
    onError: (error, variables) => {
      const tempId = (variables as FormData).get('tempId') as string
      if (tempId) {
        setUploadingMedias(prev =>
          prev.map(media =>
            media.id === tempId
              ? { ...media, error: error.message || '上传失败' }
              : media,
          ),
        )
      }
    },
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files || files.length === 0) {
      return
    }

    // 判断是否有不支持的格式
    const isValid = files.some((file) => {
      return file.type.startsWith('image/') || file.type.startsWith('video/')
    })

    // 验证文件类型
    if (!isValid) {
      return setError('请选择图片或视频文件')
    }

    setError('') // 清除之前的错误

    function upload(file: File) {
      // 创建临时预览
      const tempId = crypto.randomUUID()
      const preview = URL.createObjectURL(file)
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video'
      setUploadingMedias(prev => [...prev, { id: tempId, preview, type: mediaType }])

      // 上传文件
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('tempId', tempId)

      if (mediaType === 'image') {
        uploadImage(formData, {
          onSuccess() {
            URL.revokeObjectURL(preview)
          },
        })
      }
      else {
        uploadVideo(formData, {
          onSuccess() {
            URL.revokeObjectURL(preview)
          },
        })
      }
    }

    files.forEach(file => upload(file))

    // 清空 input 值，以便可以重复选择同一文件
    e.target.value = ''
  }

  const handleRemoveUploadingMedia = (id: string) => {
    setUploadingMedias(prev => prev.filter(media => media.id !== id))
  }

  // 监听 uploadingMedias 变化，通知父组件
  useEffect(() => {
    onUploadingChange?.(uploadingMedias.length > 0)
  }, [uploadingMedias, onUploadingChange])

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className={cn('grid grid-cols-3 gap-1', className)}>
        {/* 已上传的媒体 */}
        {medias.map(media => (
          <div key={media.id} className="relative aspect-square group rounded-lg overflow-hidden">
            {isVideo(media)
              ? (
                  <video
                    src={media.file_url}
                    className="object-cover w-full h-full"
                    muted
                    preload="metadata"
                  />
                )
              : (
                  <AssetImageWithData
                    image={media}
                    className="object-cover"
                  />
                )}
            <button
              onClick={() => onMediaRemoveAction(media)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {isVideo(media) && (
              <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 text-white text-xs rounded">
                视频
              </div>
            )}
          </div>
        ))}

        {/* 正在上传的媒体 */}
        {uploadingMedias.map(media => (
          <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden">
            {media.type === 'video'
              ? (
                  <video
                    src={media.preview}
                    className="object-cover w-full h-full opacity-50"
                    muted
                    preload="metadata"
                  />
                )
              : (
                  <img
                    src={media.preview}
                    alt="正在上传"
                    className="object-cover w-full h-full opacity-50"
                  />
                )}
            {media.error
              ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 cursor-pointer" onClick={() => handleRemoveUploadingMedia(media.id)}>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-white px-2 text-center">{media.error}</span>
                  </div>
                )
              : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
            {media.type === 'video' && !media.error && (
              <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 text-white text-xs rounded">
                上传中
              </div>
            )}
          </div>
        ))}

        {/* 上传按钮 */}
        {(medias.length + uploadingMedias.length) < maxMedias && Boolean(medias.length || uploadingMedias.length) && (
          <div className="relative aspect-square">
            <AuthenticatedOnly disableChildren>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-full h-full border-2 border-dashed border-gray-500 rounded-lg',
                  'hover:border-white/50 transition-colors flex items-center justify-center',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
                type="button"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </AuthenticatedOnly>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
