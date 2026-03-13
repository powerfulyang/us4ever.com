'use client'

import type { Video } from '@/server/api/routers/asset'
import {
  Download,
  Film,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatFileSize } from '@/utils'
import { cn } from '@/utils/cn'

interface VideoPlayerProps {
  video: Video
  onDelete?: () => void
}

export function VideoPlayer({ video, onDelete }: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 自动隐藏控制条
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
      return
    }

    const hideControls = () => {
      setShowControls(false)
    }

    controlsTimeoutRef.current = setTimeout(hideControls, 3000)

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls])

  // 处理播放/暂停
  const togglePlay = () => {
    if (!isLoaded) {
      setIsLoaded(true)
      setIsPlaying(true)
    }
    else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      }
      else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // 处理静音切换
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // 更新进度
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setDuration(total)
      setProgress(total ? (current / total) * 100 : 0)
    }
  }

  // 格式化时间
  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time))
      return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 点击进度条跳转
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !isLoaded)
      return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    videoRef.current.currentTime = newTime
    setProgress(percent * 100)
  }

  // 重置控制条隐藏计时
  const resetControlsTimer = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(setShowControls, 3000, false)
    }
  }

  return (
    <div
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/50 shadow-inner"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 视频元素 - 仅在点击播放后加载 */}
      {isLoaded && (
        <video
          ref={videoRef}
          src={video.file_url}
          className="w-full h-full object-contain bg-black"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
            <Film className="w-7 h-7 text-primary/70" />
          </div>
          <p className="text-sm text-foreground/80 text-center line-clamp-2 font-medium">
            {video.name}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            点击播放加载视频
          </p>
        </div>
      )}

      {/* 播放按钮遮罩 */}
      {(!isLoaded || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white/95 hover:bg-white text-foreground flex items-center justify-center transform hover:scale-110 transition-all duration-200 shadow-xl"
          >
            <Play className="w-6 h-6 ml-1 text-primary" fill="currentColor" />
          </button>
        </div>
      )}

      {/* 暂停按钮（播放中悬停显示） */}
      {isLoaded && isPlaying && showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/70 text-white flex items-center justify-center transform hover:scale-110 transition-all duration-200 pointer-events-auto shadow-lg"
          >
            <Pause className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
      )}

      {/* 控制条 */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pb-3 transition-all duration-300',
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        {/* 进度条 */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress hover:h-2 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-md scale-0 group-hover/progress:scale-100" />
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
            >
              {isPlaying
                ? <Pause className="w-4 h-4" fill="currentColor" />
                : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
            >
              {isMuted
                ? <VolumeX className="w-4 h-4" />
                : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-white/90 ml-1 font-medium">
              {formatTime(currentTime)}
              <span className="text-white/50 mx-1">/</span>
              {formatTime(duration)}
            </span>
          </div>

          {/* 更多操作 */}
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:scale-105"
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
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-xs text-white font-medium line-clamp-1 drop-shadow-sm">{video.name}</p>
        <p className="text-[10px] text-white/70 mt-1">
          {formatFileSize(video.file?.size)}
        </p>
      </div>
    </div>
  )
}
