'use client'

import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { motion, useMotionValue } from 'framer-motion'
import { useCallback, useState } from 'react'

interface ImagePreviewModalProps {
  src?: string
  alt?: string
  isOpen: boolean
  onClose: () => void
}

export function ImagePreviewModal({ src = '', alt = '预览图片', isOpen, onClose }: ImagePreviewModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  // 双击切换缩放
  const handleDoubleClick = useCallback(() => {
    setScale(scale === 1 ? 2 : 1)
  }, [scale])

  // 点击背景关闭
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget)
      onClose()
  }, [onClose])

  // 重置所有变换
  const handleReset = useCallback(() => {
    setScale(1)
    setRotation(0)
    dragX.set(0)
    dragY.set(0)
  }, [dragX, dragY])

  // 旋转图片
  const handleRotate = useCallback((direction: 'left' | 'right') => {
    setRotation(prev => prev + (direction === 'left' ? -90 : 90))
  }, [])

  if (!src)
    return null

  return (
    <Dialog isOpen={isOpen} onCloseAction={onClose}>
      <div
        className="relative flex items-center justify-center w-full h-full"
        onClick={handleBackgroundClick}
      >
        <motion.img
          drag
          dragElastic={0.1}
          dragMomentum={false}
          style={{
            x: dragX,
            y: dragY,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale,
            opacity: 1,
            rotate: rotation,
          }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          src={src}
          alt={alt}
          onDoubleClick={handleDoubleClick}
          className={cn(
            'max-w-full max-h-full',
            'object-contain',
            'cursor-move',
          )}
        />

        {/* 控制按钮组 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-lg bg-black/50">
          <button
            type="button"
            onClick={() => handleRotate('left')}
            title="向左旋转"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9.5l-1.5-1.5L10 6.5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 8h6.75a4 4 0 110 8h-5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleRotate('right')}
            title="向右旋转"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9.5l1.5-1.5L14 6.5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 8H8.75a4 4 0 100 8h5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setScale(prev => prev + 0.5)}
            title="放大"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setScale(prev => Math.max(0.1, prev - 0.5))}
            title="缩小"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="重置"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          title="关闭"
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Dialog>
  )
}
