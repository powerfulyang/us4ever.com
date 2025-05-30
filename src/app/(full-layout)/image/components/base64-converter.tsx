'use client'

import { useCallback, useState } from 'react'
import { UploadArea } from '@/app/(full-layout)/image/components/upload-area'
import { Button } from '@/components/ui/button'
import { Truncate } from '@/components/ui/truncate'
import { formatFileSize, formatThousands } from '@/utils'

interface PreviewImage {
  url: string
  base64: string
  name: string
  size: number
}

export function Base64Converter() {
  const [image, setImage] = useState<PreviewImage>()
  const [copied, setCopied] = useState(false)

  const handleFileSelect = async (file?: File) => {
    if (!file)
      return
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
  }

  const handleCopy = useCallback(async () => {
    if (image?.base64) {
      await navigator.clipboard.writeText(image.base64)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [image?.base64])

  return (
    <div className="flex flex-col max-w-3xl m-auto gap-4">
      <UploadArea
        onFileSelect={handleFileSelect}
      />

      {image && (
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-xl p-4 border border-white/20">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">文件名</div>
                <Truncate className="text-white">
                  {image.name}
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
                  字符
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
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
        </div>
      )}
    </div>
  )
}
