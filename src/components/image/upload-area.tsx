'use client'

import { useImageUpload } from '@/hooks/use-image-upload'
import { cn } from '@/utils/cn'
import Image from 'next/image'
import React, { useState } from 'react'
import { ImagePreviewModal } from './preview-modal'

interface UploadAreaProps {
  onFileSelect?: (file: File) => void
  preview?: string
  className?: string
  disabled?: boolean
}

export function UploadArea({
  onFileSelect,
  preview: externalPreview,
  className,
  disabled = false,
}: UploadAreaProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { preview: internalPreview, handleFile, handleDrop, accept } = useImageUpload({
    onFileSelect,
  })

  // 使用外部传入的预览或内部状态
  const preview = externalPreview ?? internalPreview

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file)
      handleFile(file)
  }

  const handleAreaDrop = (e: React.DragEvent) => {
    handleDrop(e as unknown as DragEvent)
  }

  const ref = useRef<HTMLInputElement>(null)

  return (
    <>
      <div
        className={cn(
          'relative group',
          'border-2 border-dashed border-gray-600 rounded-xl',
          'hover:border-purple-500/50 transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          preview ? 'p-2' : 'p-8',
          className,
        )}
        onDrop={handleAreaDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && ref.current?.click()}
      >
        <input
          ref={ref}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        {preview
          ? (
              <div
                className="relative h-[200px] overflow-hidden rounded-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPreviewOpen(true)
                }}
              >
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p
                    onClick={(e) => {
                      e.stopPropagation()
                      ref.current?.click()
                    }}
                    className="text-white text-sm"
                  >
                    重新上传
                  </p>
                </div>
              </div>
            )
          : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-gray-400">
                  <p className="mb-2">拖拽图片到这里，或点击选择图片</p>
                  <p className="text-sm text-center">支持拖拽、粘贴上传图片</p>
                </div>
              </div>
            )}
      </div>

      <ImagePreviewModal
        src={preview}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  )
}
