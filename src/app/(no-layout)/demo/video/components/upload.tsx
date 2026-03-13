'use client'

import { Upload, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
}

export function VideoUpload() {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadingFile[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const utils = api.useUtils()

  const { mutate, isPending } = api.asset.uploadVideo.useMutation({
    onSuccess: () => {
      void utils.asset.fetchVideosByCursor.invalidate()
    },
  })

  const handleFiles = (files: File[]) => {
    for (const file of files) {
      const id = Math.random().toString(36).substring(7)
      setUploadingFiles(prev => [...prev, {
        id,
        file,
        progress: 0,
        status: 'uploading',
      }])

      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'demo')

      mutate(formData, {
        onSuccess: () => {
          setUploadingFiles(prev =>
            prev.map(f => f.id === id ? { ...f, progress: 100, status: 'success' } : f),
          )
          // 2秒后移除成功的上传项
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.id !== id))
          }, 2000)
        },
        onError: () => {
          setUploadingFiles(prev =>
            prev.map(f => f.id === id ? { ...f, status: 'error' } : f),
          )
        },
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = [...e.dataTransfer.files].filter(file =>
      file.type.startsWith('video/'),
    )
    handleFiles(files)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files)
      return
    handleFiles([...files])
    // 重置 input
    event.target.value = ''
  }

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatFileSize = (size: number) => {
    if (size < 1024)
      return `${size} B`
    if (size < 1024 * 1024)
      return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="w-full max-w-2xl">
      {/* 拖拽上传区域 - 玻璃态风格 */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed p-10 transition-all duration-300 cursor-pointer',
          'bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
            : 'border-border/60 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />

        <input
          ref={fileInputRef}
          accept="video/*"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative flex flex-col items-center justify-center text-center">
          <div className={cn(
            'w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-sm',
            isDragging
              ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30'
              : 'bg-gradient-to-br from-muted to-muted/60 text-muted-foreground',
          )}
          >
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            点击或拖拽上传视频
          </h3>
          <p className="text-sm text-muted-foreground/80 mb-3">
            支持 MP4、WebM、MOV 等常见视频格式
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            单个文件最大支持 100MB
          </div>
        </div>
      </div>

      {/* 上传进度列表 */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadingFiles.map(file => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all duration-300',
                'shadow-sm hover:shadow-md',
                file.status === 'success' && 'bg-green-500/5 border-green-500/30',
                file.status === 'error' && 'bg-destructive/5 border-destructive/30',
                file.status === 'uploading' && 'bg-card/50 border-border/80',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.file.name}
                  </p>
                  <span className="text-xs text-muted-foreground ml-3 shrink-0">
                    {formatFileSize(file.file.size)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        file.status === 'success' && 'bg-gradient-to-r from-green-500 to-green-400',
                        file.status === 'error' && 'bg-gradient-to-r from-destructive to-red-400',
                        file.status === 'uploading' && 'bg-gradient-to-r from-primary to-primary/70',
                      )}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-xs font-medium min-w-[48px] text-right',
                    file.status === 'success' && 'text-green-600',
                    file.status === 'error' && 'text-destructive',
                    file.status === 'uploading' && 'text-muted-foreground',
                  )}
                  >
                    {file.status === 'success' && '完成 ✓'}
                    {file.status === 'error' && '失败 ✗'}
                    {file.status === 'uploading' && isPending && `${file.progress}%`}
                  </span>
                </div>
              </div>
              {file.status === 'error' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeUploadingFile(file.id)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
