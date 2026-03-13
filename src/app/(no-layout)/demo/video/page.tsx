'use client'

import {
  Download,
  Film,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Empty } from '@/components/layout/Empty'
import { Button } from '@/components/ui/button'
import { Confirm } from '@/components/ui/confirm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'

// ==================== 类型定义 ====================
interface Video {
  id: string
  name: string
  file_url: string
  file?: {
    size: number
  }
}

interface VideoPlayerProps {
  video: Video
  onDelete?: () => void
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
}

// ==================== 视频播放器组件 ====================
function VideoPlayer({ video, onDelete }: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      return
    }
    const hideControls = () => setShowControls(false)
    controlsTimeoutRef.current = setTimeout(hideControls, 3000)
    return () => {
      if (controlsTimeoutRef.current)
        clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying, showControls])

  const togglePlay = () => {
    if (!isLoaded) {
      setIsLoaded(true)
      setIsPlaying(true)
    }
    else if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setDuration(total)
      setProgress(total ? (current / total) * 100 : 0)
    }
  }

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time))
      return '00:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !isLoaded)
      return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    videoRef.current.currentTime = newTime
    setProgress(percent * 100)
  }

  const resetControlsTimer = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current)
      clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(setShowControls, 3000, false)
    }
  }

  return (
    <div
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 视频元素 */}
      {isLoaded && (
        <video
          ref={videoRef}
          src={video.file_url}
          className="w-full h-full object-cover"
          muted={isMuted}
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* 封面/占位区域 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25 group-hover:scale-110 group-hover:shadow-violet-500/40 transition-all duration-500">
            <Film className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 text-center line-clamp-2 font-medium">
            {video.name}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            点击播放
          </p>
        </div>
      )}

      {/* 播放按钮遮罩 */}
      {(!isLoaded || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center transform hover:scale-110 transition-all duration-300 shadow-2xl"
          >
            <Play className="w-7 h-7 ml-1 fill-current" />
          </button>
        </div>
      )}

      {/* 暂停按钮 */}
      {isLoaded && isPlaying && showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transform hover:scale-110 transition-all duration-200 pointer-events-auto"
          >
            <Pause className="w-6 h-6 fill-current" />
          </button>
        </div>
      )}

      {/* 控制条 */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-all duration-300',
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        {/* 进度条 */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
            >
              {isPlaying
                ? <Pause className="w-4 h-4 fill-current" />
                : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-sm text-white/90 font-medium">
              {formatTime(currentTime)}
              {' '}
              /
              {formatTime(duration)}
            </span>
          </div>

          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => window.open(video.file_url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  下载视频
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 视频列表组件 ====================
function VideoList() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const utils = api.useUtils()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, error }
    = api.asset.fetchVideosByCursor.useInfiniteQuery(
      {},
      { getNextPageParam: lastPage => lastPage.nextCursor },
    )

  const deleteMutation = api.asset.deleteVideo.useMutation({
    onSuccess: () => {
      void utils.asset.fetchVideosByCursor.invalidate()
      setIsConfirmOpen(false)
      setDeleteId(null)
    },
  })

  const allVideos = data?.pages.flatMap(page => page.items) ?? []

  if (isPending) {
    return <LoadingSpinner text="正在加载视频..." />
  }

  if (!allVideos.length && !isPending) {
    return (
      <Empty
        title="暂无视频"
        description="上传一个视频开始体验"
        icon={<Film className="w-12 h-12 text-slate-300" />}
      />
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          共
          {' '}
          {allVideos.length}
          {' '}
          个视频
        </p>
      </div>

      <InfiniteScroll
        onLoadMore={fetchNextPage}
        loading={isFetchingNextPage}
        hasMore={hasNextPage}
        error={!!error}
        className="w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allVideos.map(video => (
            <VideoPlayer
              key={video.id}
              video={video}
              onDelete={() => {
                setDeleteId(video.id)
                setIsConfirmOpen(true)
              }}
            />
          ))}
        </div>
      </InfiniteScroll>

      <Confirm
        isOpen={isConfirmOpen}
        onCloseAction={() => setIsConfirmOpen(false)}
        onConfirmAction={() => deleteId && deleteMutation.mutate({ id: deleteId })}
        isConfirmLoading={deleteMutation.isPending}
        title="删除视频"
        content="确定要删除这个视频吗？此操作不可撤销。"
      />
    </>
  )
}

// ==================== 上传组件 ====================
function VideoUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const utils = api.useUtils()

  const { mutate } = api.asset.uploadVideo.useMutation({
    onSuccess: () => void utils.asset.fetchVideosByCursor.invalidate(),
  })

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      const id = Math.random().toString(36).substring(7)
      setUploadingFiles(prev => [...prev, { id, file, progress: 0, status: 'uploading' }])

      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'demo')

      mutate(formData, {
        onSuccess: () => {
          setUploadingFiles(prev =>
            prev.map(f => (f.id === id ? { ...f, progress: 100, status: 'success' } : f)),
          )
          setTimeout(() => setUploadingFiles(prev => prev.filter(f => f.id !== id)), 2000)
        },
        onError: () => {
          setUploadingFiles(prev =>
            prev.map(f => (f.id === id ? { ...f, status: 'error' } : f)),
          )
        },
      })
    })
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
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('video/'))
    handleFiles(files)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles([...e.target.files])
      e.target.value = ''
    }
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
    <div className="w-full max-w-xl">
      {/* 拖拽上传区域 */}
      <div
        className={cn(
          'relative rounded-3xl border-2 border-dashed p-10 transition-all duration-300 cursor-pointer overflow-hidden',
          isDragging
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20 scale-[1.02]'
            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-slate-900/50',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />

        <input
          ref={fileInputRef}
          accept="video/*"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative flex flex-col items-center justify-center text-center">
          <div
            className={cn(
              'w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-300',
              isDragging
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white scale-110 shadow-xl shadow-violet-500/30'
                : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300',
            )}
          >
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            点击或拖拽上传视频
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            支持 MP4、WebM、MOV 等常见视频格式
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
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
                'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300',
                file.status === 'success' && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
                file.status === 'error' && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
                file.status === 'uploading' && 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {file.file.name}
                  </p>
                  <span className="text-xs text-slate-400 ml-2 shrink-0">
                    {formatFileSize(file.file.size)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        file.status === 'success' && 'bg-green-500',
                        file.status === 'error' && 'bg-red-500',
                        file.status === 'uploading' && 'bg-gradient-to-r from-violet-500 to-fuchsia-500',
                      )}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium min-w-[48px] text-right',
                      file.status === 'success' && 'text-green-600',
                      file.status === 'error' && 'text-red-600',
                      file.status === 'uploading' && 'text-slate-500',
                    )}
                  >
                    {file.status === 'success' && '上传成功'}
                    {file.status === 'error' && '上传失败'}
                    {file.status === 'uploading' && `${file.progress}%`}
                  </span>
                </div>
              </div>
              {file.status === 'error' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full hover:bg-red-100 hover:text-red-600"
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

// ==================== 主页面组件 ====================
export default function VideoDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
            <Film className="w-4 h-4" />
            视频播放器
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            我的视频库
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            点击视频卡片即可加载并播放，支持进度条拖拽、静音切换等交互
          </p>
        </div>

        <div className="space-y-12">
          <div className="flex flex-col items-center">
            <VideoUpload />
          </div>
          <VideoList />
        </div>
      </div>
    </div>
  )
}
