'use client'

import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  X,
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
  isLoaded: boolean
}

type ViewAction
  = | { type: 'RESET', payload: number }
    | { type: 'PAGINATE', payload: { page: number, direction: number } }
    | { type: 'SET_LOADED', payload: boolean }

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case 'RESET':
      return {
        page: action.payload,
        direction: 0,
        isLoaded: false,
      }
    case 'PAGINATE':
      return {
        ...state,
        page: action.payload.page,
        direction: action.payload.direction,
        isLoaded: false,
      }
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
    isLoaded: false,
  }))

  const { page, direction, isLoaded } = state

  // 同步外部 currentIndex
  const [prevIndex, setPrevIndex] = useState(currentIndex)
  if (currentIndex !== prevIndex) {
    setPrevIndex(currentIndex)
    dispatch({ type: 'RESET', payload: currentIndex })
  }

  // 这里的 page 实际上就是当前图片的索引
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

    window.history.pushState({ modal: 'image-preview' }, '')

    const handlePopState = () => {
      onCloseAction()
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onCloseAction])

  const handleClose = useCallback(() => {
    if (isOpen) {
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

  // 拖拽手势
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const bgOpacity = useTransform(dragY, [0, 400], [1, 0.2])
  const imageDragScale = useTransform(dragY, [0, 400], [1, 0.7])

  if (!images.length)
    return null

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-none w-screen h-screen m-0 p-0 border-0 bg-transparent [&>button]:hidden overflow-hidden">
        {/* 透明度随拖拽变化的背景 */}
        <motion.div
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
          style={{ opacity: bgOpacity }}
        />

        <div className="relative w-full h-full flex flex-col overflow-hidden select-none touch-none">
          {preloadIndices.map(idx => (
            <ImagePreloader key={images[idx]!.src} src={images[idx]!.src} />
          ))}

          {/* 右上角关闭按钮 */}
          <div className="absolute top-0 right-0 z-[60] p-4 flex items-center gap-4">
            <div className="text-white/60 text-sm font-medium px-3 py-1 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
              {activeIndex + 1}
              {' '}
              /
              {images.length}
            </div>
            <button
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full transition-all text-white border border-white/10 backdrop-blur-sm group"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* 图片显示区 */}
          <div className="flex-1 w-full h-full relative">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  y: dragY,
                  x: dragX,
                  scale: imageDragScale,
                }}
                className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDragEnd={(_, { offset, velocity }) => {
                  // 向下滑动或快速向下滑动退出
                  if (offset.y > 150 || (offset.y > 50 && velocity.y > 500)) {
                    handleClose()
                    return
                  }

                  // 左右切换
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500
                  if (swipe) {
                    if (offset.x > 0)
                      handlePaginate(-1)
                    else handlePaginate(1)
                  }
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget)
                    handleClose()
                }}
              >
                <div className="relative group flex items-center justify-center w-full h-full pointer-events-none">
                  <motion.img
                    src={isLoaded ? currentImage?.src : (currentImage?.placeholder || currentImage?.src)}
                    alt={currentImage?.alt || '预览图片'}
                    draggable={false}
                    onLoad={() => dispatch({ type: 'SET_LOADED', payload: true })}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={cn(
                      'shadow-2xl object-contain rounded-sm transition-[filter] duration-500 pointer-events-auto max-w-full max-h-full',
                      !isLoaded && 'blur-xl',
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
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/15 text-white rounded-full backdrop-blur-md hidden md:flex items-center justify-center transition-all border border-white/10 disabled:opacity-0 group"
                disabled={activeIndex === 0}
              >
                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: activeIndex < images.length - 1 ? 1 : 0, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePaginate(1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/15 text-white rounded-full backdrop-blur-md hidden md:flex items-center justify-center transition-all border border-white/10 disabled:opacity-0 group"
                disabled={activeIndex === images.length - 1}
              >
                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </>
          )}

          {/* 简约指示条 */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 px-4 pointer-events-none">
              {images.map((_, idx) => (
                <div
                  key={images[idx]?.src || idx}
                  className={cn(
                    'h-1 rounded-full transition-all duration-300',
                    idx === activeIndex ? 'w-8 bg-white/80' : 'w-1.5 bg-white/20',
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
