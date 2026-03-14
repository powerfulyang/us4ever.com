'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ImageType {
  src: string
  placeholder?: string
  alt?: string
  width?: number
  height?: number
}

interface ImagePreviewModalProps {
  isOpen: boolean
  onCloseAction: () => void
  currentIndex?: number
  images: ImageType[]
  onCurrentIndexChange?: (index: number) => void
}

interface ImagePreviewModalSimpleProps {
  isOpen: boolean
  onCloseAction: () => void
  src: string
  alt?: string
  placeholder?: string
}

/**
 * 预加载图片组件
 */
function ImagePreloader({ src }: { src: string }) {
  useEffect(() => {
    if (!src)
      return
    const img = new Image()
    img.src = src
  }, [src])
  return null
}

export function ImagePreviewModalSimple(props: ImagePreviewModalSimpleProps) {
  const { src, alt, placeholder, ...rest } = props
  const images = useMemo(() => {
    return [{ src, alt, placeholder: placeholder || src }]
  }, [alt, placeholder, src])
  return <ImagePreviewModal {...rest} images={images} />
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
}

interface ViewState {
  page: number
  direction: number
  scale: number
  rotation: number
  isFullSize: boolean
  isLoaded: boolean
}

type ViewAction
  = | { type: 'RESET', payload: number }
    | { type: 'PAGINATE', payload: { page: number, direction: number } }
    | { type: 'SET_SCALE', payload: number }
    | { type: 'SET_ROTATION', payload: number }
    | { type: 'TOGGLE_FULLSIZE' }
    | { type: 'SET_LOADED', payload: boolean }

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case 'RESET':
      return {
        page: action.payload,
        direction: 0,
        scale: 1,
        rotation: 0,
        isFullSize: false,
        isLoaded: false,
      }
    case 'PAGINATE':
      return {
        ...state,
        page: action.payload.page,
        direction: action.payload.direction,
        scale: 1,
        rotation: 0,
        isLoaded: false,
      }
    case 'SET_SCALE':
      return { ...state, scale: action.payload }
    case 'SET_ROTATION':
      return { ...state, rotation: action.payload }
    case 'TOGGLE_FULLSIZE':
      return { ...state, isFullSize: !state.isFullSize }
    case 'SET_LOADED':
      return { ...state, isLoaded: action.payload }
    default:
      return state
  }
}

export function ImagePreviewModal(props: ImagePreviewModalProps) {
  const { isOpen, onCloseAction, images, currentIndex = 0, onCurrentIndexChange } = props
  const [state, dispatch] = useReducer(viewReducer, currentIndex, (index: number) => ({
    page: index,
    direction: 0,
    scale: 1,
    rotation: 0,
    isFullSize: false,
    isLoaded: false,
  }))

  const { page, direction, scale, rotation, isFullSize, isLoaded } = state

  // 同步外部 currentIndex
  const [prevIndex, setPrevIndex] = useState(currentIndex)
  if (currentIndex !== prevIndex) {
    setPrevIndex(currentIndex)
    dispatch({ type: 'RESET', payload: currentIndex })
  }

  // 这里的 page 实际上就是当前图片的索引，但为了动画效果我们使用这种方式
  const activeIndex = useMemo(() => {
    if (!images.length)
      return 0
    return Math.max(0, Math.min(page, images.length - 1))
  }, [page, images.length])

  const currentImage = images[activeIndex]

  // 仅在打开时重置
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET', payload: currentIndex })
    }
  }, [isOpen, currentIndex])

  // 处理浏览器回退
  useEffect(() => {
    if (!isOpen)
      return

    // 当预览打开时，向历史记录添加一个状态
    window.history.pushState({ modal: 'image-preview' }, '')

    const handlePopState = () => {
      // 这里的 state 可能为 null 或者我们 push 进去的对象
      // 如果触发了 popstate，说明用户点击了返回键
      onCloseAction()
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onCloseAction])

  const handleClose = useCallback(() => {
    if (isOpen) {
      // 如果是手动关闭（点击 X 或背景），我们需要“回退”一下历史记录来清理状态
      window.history.back()
    }
  }, [isOpen])

  /**
   * 切换图片
   */
  const handlePaginate = useCallback((newDirection: number) => {
    const nextIndex = activeIndex + newDirection
    if (nextIndex >= 0 && nextIndex < images.length) {
      dispatch({ type: 'PAGINATE', payload: { page: nextIndex, direction: newDirection } })
      onCurrentIndexChange?.(nextIndex)
    }
  }, [activeIndex, images.length, onCurrentIndexChange])

  // 键盘支持
  useEffect(() => {
    if (!isOpen)
      return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')
        handlePaginate(-1)
      else if (e.key === 'ArrowRight')
        handlePaginate(1)
      else if (e.key === 'Escape')
        handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePaginate, handleClose])

  // 预加载前后图片
  const preloadIndices = useMemo(() => {
    const indices = []
    if (activeIndex > 0)
      indices.push(activeIndex - 1)
    if (activeIndex < images.length - 1)
      indices.push(activeIndex + 1)
    return indices
  }, [activeIndex, images.length])

  if (!images.length)
    return null

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-none w-screen h-screen m-0 p-0 border-0 bg-black/95 backdrop-blur-sm transition-colors duration-300 [&>button]:hidden">
        <div className="relative w-full h-full flex flex-col overflow-hidden select-none touch-none">
          {preloadIndices.map(idx => (
            <ImagePreloader key={images[idx]!.src} src={images[idx]!.src} />
          ))}

          {/* 顶部工具栏 */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="text-white/80 text-sm font-medium px-3 py-1 bg-black/40 rounded-full backdrop-blur-md">
              {activeIndex + 1}
              {' '}
              /
              {images.length}
            </div>
            <div className="flex items-center gap-2">
              <ControlButton onClick={() => dispatch({ type: 'SET_ROTATION', payload: rotation - 90 })} icon={<RotateCcw className="w-5 h-5" />} title="向左旋转" />
              <ControlButton onClick={() => dispatch({ type: 'SET_ROTATION', payload: rotation + 90 })} icon={<RotateCw className="w-5 h-5" />} title="向右旋转" />
              <div className="w-px h-4 bg-white/20 mx-1" />
              <ControlButton onClick={() => dispatch({ type: 'SET_SCALE', payload: Math.max(0.2, scale - 0.2) })} icon={<ZoomOut className="w-5 h-5" />} title="缩小" />
              <ControlButton onClick={() => dispatch({ type: 'SET_SCALE', payload: Math.min(5, scale + 0.2) })} icon={<ZoomIn className="w-5 h-5" />} title="放大" />
              <ControlButton
                onClick={() => dispatch({ type: 'TOGGLE_FULLSIZE' })}
                icon={isFullSize ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                title={isFullSize ? '适应屏幕' : '原始尺寸'}
              />
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button
                onClick={handleClose}
                className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 图片显示区 */}
          <div
            className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget)
                handleClose()
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
                drag={scale === 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500
                  if (swipe) {
                    if (offset.x > 0)
                      handlePaginate(-1)
                    else handlePaginate(1)
                  }
                }}
              >
                <div className="relative group flex items-center justify-center w-full h-full">
                  <motion.img
                    src={isLoaded ? currentImage?.src : (currentImage?.placeholder || currentImage?.src)}
                    alt={currentImage?.alt || '预览图片'}
                    draggable={false}
                    onLoad={() => dispatch({ type: 'SET_LOADED', payload: true })}
                    animate={{
                      scale,
                      rotate: rotation,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                      cursor: scale > 1 ? 'move' : 'zoom-in',
                    }}
                    onDoubleClick={() => dispatch({ type: 'SET_SCALE', payload: scale === 1 ? 2 : 1 })}
                    className={cn(
                      'shadow-2xl object-contain rounded-sm transition-[filter] duration-500',
                      !isLoaded && 'blur-xl',
                      isFullSize ? 'max-w-none max-h-none' : 'max-w-full max-h-full',
                    )}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 侧边导航按钮 */}
          {images.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: activeIndex > 0 ? 1 : 0, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePaginate(-1)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md hidden md:flex items-center justify-center transition-all disabled:opacity-0"
                disabled={activeIndex === 0}
              >
                <ChevronLeft className="w-8 h-8" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: activeIndex < images.length - 1 ? 1 : 0, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePaginate(1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md hidden md:flex items-center justify-center transition-all disabled:opacity-0"
                disabled={activeIndex === images.length - 1}
              >
                <ChevronRight className="w-8 h-8" />
              </motion.button>
            </>
          )}

          {/* 缩略图栏（可选，如果图片很多可以加） */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 pointer-events-none">
              {images.map((_, idx) => (
                <div
                  key={images[idx]?.src || idx}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    idx === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/30',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ControlButton({
  onClick,
  icon,
  title,
  disabled = false,
}: {
  onClick: () => void
  icon: React.ReactNode
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-full transition-all text-white/70 hover:text-white',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'hover:bg-white/10 active:bg-white/20',
      )}
      disabled={disabled}
    >
      {icon}
    </button>
  )
}
