'use client'

import { ImagePlus } from 'lucide-react'
import Image from 'next/image'
import React, { useImperativeHandle, useRef, useState } from 'react'
import { useImageUpload } from '@/hooks/use-image-upload'
import { cn } from '@/utils/cn'
import { ImagePreviewModalSimple } from './preview-modal'

export interface UploadAreaRef {
  reset: () => void
}

interface UploadAreaProps {
  disabledText?: string
  onFileSelect?: (file?: File) => void
  className?: string
  disabled?: boolean
  ref?: React.Ref<UploadAreaRef>
}

export function UploadArea({
  onFileSelect,
  className,
  disabled = false,
  disabledText = '请先登录',
  ref,
}: UploadAreaProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { preview: internalPreview, handleFile, handleDrop, accept, reset } = useImageUpload({
    onFileSelect,
  })

  useImperativeHandle(ref, () => {
    return {
      reset,
    }
  })

  // 使用外部传入的预览或内部状态
  const preview = internalPreview

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

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div
        title={disabled ? disabledText : ''}
        className={cn(
          'relative group',
          'border border-dashed border-gray-300 rounded-xl',
          'hover:border-purple-500/50 transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          preview ? 'p-1' : 'p-8',
          className,
        )}
        onDrop={handleAreaDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
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
                      inputRef.current?.click()
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
                  <ImagePlus className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-gray-400">
                  <p className="mb-2">拖拽图片到这里，或点击选择图片</p>
                  <p className="text-sm text-center">支持拖拽、粘贴上传图片</p>
                </div>
              </div>
            )}
      </div>

      {preview && (
        <ImagePreviewModalSimple
          src={preview}
          isOpen={isPreviewOpen}
          onCloseAction={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  )
}
