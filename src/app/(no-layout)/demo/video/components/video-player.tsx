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

  // 马卡龙配色
  const pastelColors = [
    'from-pink-300/30 to-rose-200/30',
    'from-rose-300/30 to-pink-200/30',
    'from-orange-200/30 to-amber-200/30',
    'from-amber-200/30 to-yellow-200/30',
    'from-emerald-200/30 to-teal-200/30',
    'from-cyan-200/30 to-sky-200/30',
    'from-sky-300/30 to-blue-200/30',
    'from-violet-200/30 to-purple-200/30',
    'from-fuchsia-200/30 to-pink-200/30',
  ]

  // 随机选择一个配色
  const colorIndex = video.id.charCodeAt(0) % pastelColors.length

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
      className={cn(
        'group relative aspect-[9/16] rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer',
        'bg-gradient-to-br shadow-lg hover:shadow-pink-300/50 dark:hover:shadow-pink-700/40 transition-all duration-500',
        pastelColors[colorIndex],
        isLoaded && 'shadow-pink-200/50 dark:shadow-pink-900/30',
      )}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 视频元素 - 仅在点击播放后加载 */}
      {isLoaded && (
        <video
          ref={videoRef}
          src={video.file_url}
          className="w-full h-full object-contain bg-gradient-to-br from-slate-900 to-slate-800"
          muted={isMuted}
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* 封面/占位区域 - 马卡龙风格 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-5">
          {/* 糖霜效果背景 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4)_0%,transparent_50%)]" />

          <div className={cn(
            'relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500',
            'bg-gradient-to-br shadow-lg backdrop-blur-sm',
            colorIndex < 3 && 'from-pink-400 to-rose-400',
            colorIndex >= 3 && colorIndex < 5 && 'from-amber-300 to-orange-300',
            colorIndex >= 5 && colorIndex < 7 && 'from-emerald-300 to-teal-300',
            colorIndex >= 7 && 'from-violet-400 to-purple-400',
          )}>
            <Film className="w-8 h-8 text-white drop-shadow-md" />
            {/* 闪光效果 */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/80 rounded-full animate-pulse" />
          </div>

          <p className="relative text-sm text-slate-700 dark:text-slate-100 text-center line-clamp-2 font-semibold drop-shadow-sm">
            {video.name}
          </p>
          <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-2">
            点击播放
          </p>
        </div>
      )}

      {/* 播放按钮遮罩 - 毛玻璃效果 */}
      {(!isLoaded || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 shadow-2xl',
              'bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-md hover:from-white hover:to-pink-50',
            )}
          >
            <Play className="w-7 h-7 ml-1 text-pink-500" fill="currentColor" />
          </button>
        </div>
      )}

      {/* 暂停按钮（播放中悬停显示） */}
      {isLoaded && isPlaying && showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white flex items-center justify-center transform hover:scale-110 transition-all duration-200 pointer-events-auto shadow-2xl"
          >
            <Pause className="w-6 h-6 text-pink-500" fill="currentColor" />
          </button>
        </div>
      )}

      {/* 控制条 - 糖果渐变 */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-transparent p-4 pb-3 transition-all duration-300',
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        {/* 进度条 - 马卡龙渐变 */}
        <div
          className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group/progress hover:h-2.5 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-100 relative shadow-lg',
              colorIndex < 3 && 'bg-gradient-to-r from-pink-400 to-rose-400',
              colorIndex >= 3 && colorIndex < 5 && 'bg-gradient-to-r from-amber-300 to-orange-400',
              colorIndex >= 5 && colorIndex < 7 && 'bg-gradient-to-r from-emerald-300 to-teal-400',
              colorIndex >= 7 && 'bg-gradient-to-r from-violet-400 to-purple-400',
            )}
            style={{ width: `${progress}%` }}
          >
            <div className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-all scale-0 group-hover/progress:scale-100',
            )} />
          </div>
        </div>

        {/* 控制按钮 - 圆润糖果风格 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                'w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg',
                'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm hover:from-pink-100 hover:to-rose-100',
              )}
            >
              {isPlaying
                ? <Pause className="w-4 h-4 text-pink-500" fill="currentColor" />
                : <Play className="w-4 h-4 ml-0.5 text-pink-500" fill="currentColor" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className={cn(
                'w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg',
                'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm hover:from-emerald-100 hover:to-teal-100',
              )}
            >
              {isMuted
                ? <VolumeX className="w-4 h-4 text-emerald-500" />
                : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
            <span className="text-xs text-white/95 ml-1 font-semibold">
              {formatTime(currentTime)}
              <span className="text-white/50 mx-1">/</span>
              {formatTime(duration)}
            </span>
          </div>

          {/* 更多操作 - 糖果风格 */}
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg',
                    'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm hover:from-violet-100 hover:to-purple-100',
                  )}
                >
                  <MoreVertical className="w-4 h-4 text-violet-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DropdownMenuItem
                  onClick={() => window.open(video.file_url, '_blank')}
                  className="rounded-xl m-1.5 py-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-slate-600">下载视频</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="rounded-xl m-1.5 py-2.5 cursor-pointer text-red-400 focus:text-red-500 focus:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 顶部信息栏 - 糖果风格 */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-xs text-white font-semibold line-clamp-1 drop-shadow-md">{video.name}</p>
        <p className="text-[10px] text-white/70 mt-1">
          {formatFileSize(video.file?.size)}
        </p>
      </div>

      {/* 装饰性糖果元素 */}
      {!isLoaded && (
        <>
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-pink-300/60 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-amber-200/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-20 left-4 w-2.5 h-2.5 rounded-full bg-emerald-200/40 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </>
      )}
    </div>
  )
}
