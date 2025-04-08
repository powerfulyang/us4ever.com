'use client'

import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

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

export function ImagePreviewModalSimple(props: ImagePreviewModalSimpleProps) {
  const { src, alt, placeholder, ...rest } = props
  const images = useMemo(() => {
    return [{ src, alt, placeholder: placeholder || src }]
  }, [alt, placeholder, src])
  return <ImagePreviewModal {...rest} images={images} />
}

export function ImagePreviewModal(props: ImagePreviewModalProps) {
  const { isOpen, onCloseAction, images, currentIndex = 0, onCurrentIndexChange } = props

  // 判断是否为多图片模式
  const isMultipleMode = images.length > 1

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  const currentImage = images[currentIndex]
  const isWideImage = (currentImage?.width || 0) > (currentImage?.height || 0)

  const canDrag = scale !== 1

  // 重置所有变换
  const handleReset = useCallback(() => {
    setScale(1)
    setRotation(0)
    dragX.set(0)
    dragY.set(0)
  }, [dragX, dragY])

  // 双击切换缩放
  const handleDoubleClick = useCallback(() => {
    if (canDrag) {
      handleReset()
    }
    else {
      setScale(2)
    }
  }, [canDrag, handleReset])

  function handleClose() {
    onCloseAction()
    handleReset()
  }

  // 旋转图片
  const handleRotate = useCallback((direction: 'left' | 'right') => {
    setRotation(prev => prev + (direction === 'left' ? -90 : 90))
  }, [])

  // 切换图片
  const updateIndex = (newIndex: number) => {
    handleReset()
    if (isMultipleMode && onCurrentIndexChange) {
      onCurrentIndexChange(newIndex)
    }
    setIsImageLoaded(false)
  }

  const goToNextImage = () => {
    if (currentIndex < images.length - 1) {
      updateIndex(currentIndex + 1)
    }
  }

  const goToPreviousImage = () => {
    if (currentIndex > 0) {
      updateIndex(currentIndex - 1)
    }
  }

  // 预加载当前图片
  useEffect(() => {
    if (!currentImage)
      return

    const img = new Image()
    img.src = currentImage.src
    img.onload = () => setIsImageLoaded(true)

    return () => {
      img.onload = null
    }
  }, [currentImage])

  if (!images.length)
    return null

  return (
    <Dialog isOpen={isOpen} onCloseAction={handleClose}>
      <motion.div
        className="w-full h-full flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={currentImage?.src}
            drag={canDrag}
            dragElastic={0.1}
            dragMomentum={false}
            style={{ x: dragX, y: dragY }}
            animate={{
              scale,
              rotate: rotation,
              filter: isImageLoaded ? 'blur(0px)' : 'blur(10px)',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              filter: {
                duration: 0.3,
                ease: 'easeOut',
              },
            }}
            src={isImageLoaded ? currentImage?.src : currentImage?.placeholder}
            alt={currentImage?.alt || '预览图片'}
            onDoubleClick={handleDoubleClick}
            className={cn(
              'object-contain',
              {
                'cursor-move': canDrag,
              },
              {
                'w-full': isMultipleMode && isWideImage,
                'h-full': isMultipleMode && !isWideImage,
                'max-w-full max-h-full': !isMultipleMode,
              },
            )}
          />
        </AnimatePresence>
      </motion.div>

      {/* 控制按钮组 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-lg bg-black/50">
        <ControlButton onClick={() => handleRotate('left')} title="向左旋转" icon={RotateLeftIcon} />
        <ControlButton onClick={() => handleRotate('right')} title="向右旋转" icon={RotateRightIcon} />
        <ControlButton onClick={() => setScale(prev => prev + 0.5)} title="放大" icon={ZoomInIcon} />
        <ControlButton onClick={() => setScale(prev => Math.max(0.1, prev - 0.5))} title="缩小" icon={ZoomOutIcon} />
        <ControlButton onClick={handleReset} title="重置" icon={ResetIcon} />
        {isMultipleMode && (
          <>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <ControlButton
              onClick={goToPreviousImage}
              title="上一张"
              icon={PreviousIcon}
              disabled={currentIndex === 0}
            />
            <span className="text-white text-sm px-2">
              {currentIndex + 1}
              /
              {images.length}
            </span>
            <ControlButton
              onClick={goToNextImage}
              title="下一张"
              icon={NextIcon}
              disabled={currentIndex === images.length - 1}
            />
          </>
        )}
      </div>

      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={handleClose}
        title="关闭"
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
      >
        <CloseIcon className="w-6 h-6 text-white" />
      </button>
    </Dialog>
  )
}

function ControlButton({
  onClick,
  title,
  icon: Icon,
  disabled = false,
}: {
  onClick: () => void
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-full transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-white/20 active:bg-white/30',
      )}
      disabled={disabled}
    >
      <Icon className="w-5 h-5 text-white" />
    </button>
  )
}

// SVG 图标组件保持不变...

function RotateLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9.5l-1.5-1.5L10 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 8h6.75a4 4 0 110 8h-5" />
    </svg>
  )
}

function RotateRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9.5l1.5-1.5L14 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 8H8.75a4 4 0 100 8h5" />
    </svg>
  )
}

function ZoomInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
      />
    </svg>
  )
}

function ZoomOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6"
      />
    </svg>
  )
}

function ResetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

function PreviousIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function NextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
