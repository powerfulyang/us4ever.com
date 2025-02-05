'use client'

import type { ChangeEvent } from 'react'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { AssetImage } from '@/components/image/image'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  images: string[]
  onImageSelectAction: (imageId: string) => void
  onImageRemoveAction: (imageId: string) => void
  maxImages?: number
  className?: string
}

interface UploadingImage {
  id: string
  preview: string
  error?: string
}

export function ImageUpload({
  images,
  onImageSelectAction,
  onImageRemoveAction,
  maxImages = 9,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([])
  const [error, setError] = useState<string>('')

  const { mutate: uploadImage } = api.asset.upload_image.useMutation({
    onSuccess: (data, variables) => {
      // 从 FormData 中提取 tempId
      const tempId = (variables as FormData).get('tempId') as string
      if (tempId) {
        setUploadingImages(prev => prev.filter(img => img.id !== tempId))
      }
      onImageSelectAction(data.id)
    },
    onError: (error, variables) => {
      const tempId = (variables as FormData).get('tempId') as string
      if (tempId) {
        setUploadingImages(prev =>
          prev.map(img =>
            img.id === tempId
              ? { ...img, error: error.message || '上传失败' }
              : img,
          ),
        )
      }
    },
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    // 验证文件类型
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('请选择图片或视频文件')
      return
    }

    setError('') // 清除之前的错误

    // 创建临时预览
    const tempId = crypto.randomUUID()
    const preview = URL.createObjectURL(file)
    setUploadingImages(prev => [...prev, { id: tempId, preview }])

    // 上传文件
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tempId', tempId) // 将 tempId 添加到 FormData
    uploadImage(formData, {
      onSuccess() {
        URL.revokeObjectURL(preview) // 清理预览URL
      },
    })

    // 清空 input 值，以便可以重复选择同一文件
    e.target.value = ''
  }

  const handleRemoveUploadingImage = (id: string) => {
    setUploadingImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className={cn('grid grid-cols-3 gap-1', className)}>
        {/* 已上传的图片 */}
        {images.map(imageId => (
          <div key={imageId} className="relative aspect-square group">
            <AssetImage
              id={imageId}
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => onImageRemoveAction(imageId)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* 正在上传的图片 */}
        {uploadingImages.map(img => (
          <div key={img.id} className="relative aspect-square">
            <Image
              src={img.preview}
              alt="正在上传"
              fill
              className="object-cover rounded-lg opacity-50"
            />
            {img.error
              ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 cursor-pointer" onClick={() => handleRemoveUploadingImage(img.id)}>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-white px-2 text-center">{img.error}</span>
                  </div>
                )
              : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
          </div>
        ))}

        {/* 上传按钮 */}
        {(images.length + uploadingImages.length) < maxImages && Boolean(images.length || uploadingImages.length) && (
          <div className="relative aspect-square">
            <AuthenticatedOnly disableChildren>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages.length > 0}
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
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
