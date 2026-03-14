'use client'

import type { MotionValue } from 'framer-motion'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
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

interface PhotoItemProps {
  item: ImageType
  i: number
  activeIndex: number
  pageValue: MotionValue<number>
  dragX: MotionValue<number>
  dragY: MotionValue<number>
  imageDragScale: MotionValue<number>
  scale: number
  isLoaded: boolean
  dispatch: React.Dispatch<ViewAction>
  handleClose: () => void
  handlePaginate: (direction: number) => void
  handleDoubleClick: () => void
}

function PhotoItem({
  item,
  i,
  activeIndex,
  pageValue,
  dragX,
  dragY,
  imageDragScale,
  scale,
  isLoaded,
  dispatch,
  handleClose,
  handlePaginate,
  handleDoubleClick,
}: PhotoItemProps) {
  const isCurrent = i === activeIndex
  // 关键计算：将页面的差值、间距 (20px)、及拖拽距离结合，从而让相邻图片跟随拖拽且丝滑归位
  const x = useTransform([pageValue, dragX], ([latestPage, latestDragX]) => {
    const pageDiff = i - (latestPage as number)
    return `calc(${pageDiff * 100}dvw + ${pageDiff * 20}px + ${latestDragX}px)`
  })

  return (
    <motion.div
      style={{
        position: 'absolute',
        // 当拖拽当前项时，直接交由 framer-motion 处理 x 和 y
        x: isCurrent ? dragX : x,
        y: isCurrent ? dragY : 0,
        scale: isCurrent ? imageDragScale : 1,
        zIndex: isCurrent ? 10 : 0,
      }}
      className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
      drag={isCurrent}
      dragConstraints={isCurrent && scale === 1 ? { left: 0, right: 0, top: 0, bottom: 0 } : false}
      dragElastic={0.8}
      onDragEnd={(_, { offset, velocity }) => {
        if (!isCurrent || scale > 1)
          return

        // 向下滑动或快速向下滑动退出
        if (offset.y > 150 || (offset.y > 50 && velocity.y > 500)) {
          handleClose()
          return
        }

        // 左右切换
        const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500
        if (swipe) {
          handlePaginate(offset.x > 0 ? -1 : 1)
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget)
          handleClose()
      }}
    >
      <div
        className="relative group flex items-center justify-center w-full h-full pointer-events-none"
        onDoubleClick={(e) => {
          e.stopPropagation()
          if (isCurrent)
            handleDoubleClick()
        }}
      >
        <motion.img
          src={(isCurrent && !isLoaded) ? (item?.placeholder || item?.src) : item?.src}
          alt={item?.alt || '预览图片'}
          draggable={false}
          onLoad={() => {
            if (isCurrent)
              dispatch({ type: 'SET_LOADED', payload: true })
          }}
          animate={{ scale: isCurrent ? scale : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'shadow-2xl object-contain rounded-sm transition-[filter] duration-500 pointer-events-auto max-w-full max-h-full',
            isCurrent ? 'cursor-grab active:cursor-grabbing' : '',
            isCurrent && !isLoaded ? 'blur-xl' : '',
          )}
        />
      </div>
    </motion.div>
  )
}

export function ImagePreviewModalSimple(props: ImagePreviewModalSimpleProps) {
  const { src, alt, placeholder, ...rest } = props
  const images = useMemo(() => {
    return [{ src, alt, placeholder: placeholder || src }]
  }, [alt, placeholder, src])
  return <ImagePreviewModal {...rest} images={images} />
}

// Removes unused variants
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

  const { page, isLoaded } = state
  const [scale, setScale] = useState(1)

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

  // 用于实现丝滑的拖拽分页和多图展示
  const pageValue = useMotionValue(currentIndex)

  useEffect(() => {
    animate(pageValue, activeIndex, { type: 'spring', stiffness: 300, damping: 30 })
  }, [activeIndex, pageValue])

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
      setScale(1)
    }
  }, [activeIndex, images.length, onCurrentIndexChange])

  const handleDoubleClick = useCallback(() => {
    setScale(s => s === 1 ? 2 : 1)
  }, [])

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
    <DialogPrimitive.Root open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-[100] max-w-none w-dvw h-[100dvh] m-0 p-0 border-0 bg-transparent overflow-hidden outline-none">
          {/* 透明度随拖拽变化的背景 */}
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            style={{ opacity: bgOpacity }}
          />

          <div className="relative w-full h-full flex flex-col overflow-hidden select-none touch-none">
            {preloadIndices.map(idx => (
              <ImagePreloader key={images[idx]!.src} src={images[idx]!.src} />
            ))}

            {/* 顶部工具栏 */}
            <div className="absolute top-0 left-0 right-0 z-[60] p-4 flex items-center justify-between text-white/80 bg-gradient-to-b from-black/50 to-transparent pointer-events-none transition-opacity duration-300">
              <div className="text-sm font-medium px-2 pointer-events-auto opacity-75">
                {activeIndex + 1}
                {' '}
                /
                {images.length}
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setScale(s => Math.min(s + 0.5, 5))
                  }}
                  className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-all opacity-75 hover:opacity-100"
                  title="放大"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setScale(s => Math.max(s - 0.5, 0.5))
                  }}
                  className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-all opacity-75 hover:opacity-100"
                  title="缩小"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="w-px h-4 bg-white/20 mx-1" />
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-all opacity-75 hover:opacity-100 group"
                  title="关闭"
                >
                  <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* 图片显示区 */}
            <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
              {images.map((item, i) => {
                if (Math.abs(activeIndex - i) > 1)
                  return null

                return (
                  <PhotoItem
                    key={item.src}
                    item={item}
                    i={i}
                    activeIndex={activeIndex}
                    pageValue={pageValue}
                    dragX={dragX}
                    dragY={dragY}
                    imageDragScale={imageDragScale}
                    scale={scale}
                    isLoaded={isLoaded}
                    dispatch={dispatch}
                    handleClose={handleClose}
                    handlePaginate={handlePaginate}
                    handleDoubleClick={handleDoubleClick}
                  />
                )
              })}
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
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 px-4 pointer-events-none z-[60]">
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
