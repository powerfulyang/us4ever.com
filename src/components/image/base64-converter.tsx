'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatFileSize } from '@/utils'
import React, { useCallback, useState } from 'react'
import { Truncate } from '../ui/truncate'

interface PreviewImage {
  url: string
  base64: string
  name: string
  size: number
}

export function Base64Converter() {
  const [image, setImage] = useState<PreviewImage | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFileChange = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setImage({
        url: URL.createObjectURL(file),
        base64,
        name: file.name,
        size: file.size,
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file)
    }
  }, [handleFileChange])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }, [handleFileChange])

  const handleCopy = useCallback(async () => {
    if (image?.base64) {
      await navigator.clipboard.writeText(image.base64)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [image?.base64])

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div
        className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-gray-400">
            <p className="mb-2">拖拽图片到这里，或点击选择图片</p>
            <p className="text-sm">支持 PNG、JPG、GIF 等常见图片格式</p>
          </div>
        </div>
      </div>

      {image && (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-48 aspect-square rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">文件名</div>
                <Truncate className="text-white max-w-[30rem]">
                  {image.name + image.name}
                </Truncate>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">文件大小</div>
                <div className="text-white">
                  {formatFileSize(image.size)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Base64 长度</div>
                <div className="text-white">
                  {formatThousands(image.base64.length, 0)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Base64 字符串</div>
              <Button
                size="xs"
                variant={copied ? 'ghost' : 'default'}
                onClick={handleCopy}
                leftIcon={copied
                  ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )
                  : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
              >
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
            <div className="bg-black/20 rounded-lg p-4 max-h-48 overflow-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
                {image.base64}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
