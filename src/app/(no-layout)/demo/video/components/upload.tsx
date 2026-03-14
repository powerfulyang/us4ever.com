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
      {/* 拖拽上传区域 - 马卡龙糖果风格 */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed p-10 transition-all duration-500 cursor-pointer',
          isDragging
            ? 'border-pink-400 bg-pink-50/80 scale-[1.02] shadow-2xl shadow-pink-300/30'
            : 'border-rose-200/60 dark:border-rose-800/40 hover:border-pink-300/60 hover:shadow-xl hover:shadow-pink-200/20 bg-gradient-to-br from-rose-25 via-white to-pink-25 dark:from-rose-950/20 dark:via-slate-900/40 dark:to-pink-950/20',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* 背景装饰 - 糖果波点 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-pink-200/30 animate-pulse" />
          <div className="absolute top-8 right-8 w-5 h-5 rounded-full bg-rose-200/30 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-6 left-12 w-6 h-6 rounded-full bg-amber-100/30 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute bottom-10 right-6 w-4 h-4 rounded-full bg-pink-100/30 animate-pulse" style={{ animationDelay: '0.9s' }} />
        </div>

        <input
          ref={fileInputRef}
          accept="video/*"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative flex flex-col items-center justify-center text-center">
          {/* 糖果图标 */}
          <div className={cn(
            'w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-xl',
            isDragging
              ? 'bg-gradient-to-br from-pink-400 to-rose-400 scale-110 shadow-pink-400/40'
              : 'bg-gradient-to-br from-rose-200 to-pink-200 dark:from-rose-700 dark:to-pink-700 hover:from-rose-300 hover:to-pink-300',
          )}
          >
            <Upload className={cn(
              'w-12 h-12 transition-all duration-500',
              isDragging ? 'text-white' : 'text-rose-600 dark:text-rose-200',
            )}
            />
            {/* 闪光装饰 */}
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-white/80 rounded-full animate-ping" />
          </div>

          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">
            点击或拖拽上传视频
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            支持 MP4、WebM、MOV 等常见视频格式
          </p>

          {/* 糖果风格标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-xs font-medium text-emerald-600 dark:text-emerald-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            单个文件最大支持 100MB
          </div>
        </div>
      </div>

      {/* 上传进度列表 - 糖果风格 */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadingFiles.map(file => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md',
                file.status === 'success' && 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/60',
                file.status === 'error' && 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200/60',
                file.status === 'uploading' && 'bg-white dark:bg-slate-900/50 border-rose-200/40',
              )}
            >
              {/* 糖果进度条图标 */}
              <div className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
                file.status === 'success' && 'bg-gradient-to-br from-emerald-400 to-teal-400',
                file.status === 'error' && 'bg-gradient-to-br from-red-400 to-rose-400',
                file.status === 'uploading' && 'bg-gradient-to-br from-rose-300 to-pink-300 animate-pulse',
              )}
              >
                {file.status === 'success' && <span className="text-white text-lg">✓</span>}
                {file.status === 'error' && <span className="text-white text-lg">✗</span>}
                {file.status === 'uploading' && <Upload className="w-5 h-5 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {file.file.name}
                  </p>
                  <span className="text-xs text-slate-400 ml-3 shrink-0 font-medium">
                    {formatFileSize(file.file.size)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out shadow-sm',
                        file.status === 'success' && 'bg-gradient-to-r from-emerald-400 to-teal-400',
                        file.status === 'error' && 'bg-gradient-to-r from-red-400 to-rose-400',
                        file.status === 'uploading' && 'bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 animate-pulse',
                      )}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-xs font-bold min-w-[48px] text-right',
                    file.status === 'success' && 'text-emerald-600 dark:text-emerald-400',
                    file.status === 'error' && 'text-red-500 dark:text-red-400',
                    file.status === 'uploading' && 'text-rose-500 dark:text-rose-400',
                  )}
                  >
                    {file.status === 'success' && '完成'}
                    {file.status === 'error' && '失败'}
                    {file.status === 'uploading' && isPending && `${file.progress}%`}
                  </span>
                </div>
              </div>
              {file.status === 'error' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500"
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
