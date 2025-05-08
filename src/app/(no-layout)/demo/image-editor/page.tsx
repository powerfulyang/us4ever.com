'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import React, { useEffect, useRef } from 'react'
import { useImageEditor } from './hooks/useImageEditor'

export default function ImageEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const {
    initCanvas,
    addBackgroundImage,
    addCharacterImage,
    enableSelectionDrawing,
    isAreaActive,
    setIsAreaActive,
    clearCanvas,
  } = useImageEditor(canvasRef)

  useEffect(() => {
    let cleanupCanvas: (() => void) | undefined
    if (canvasRef.current) {
      cleanupCanvas = initCanvas()
    }
    return () => {
      if (cleanupCanvas) {
        cleanupCanvas()
      }
    }
  }, [initCanvas])

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      void addBackgroundImage(url)
    }
  }

  const handleCharacterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      void addCharacterImage(url)
    }
  }

  const handleToggleActive = () => {
    setIsAreaActive(prev => !prev)
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-full">
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="bg-upload" className="text-sm font-medium">背景图片</label>
          <Input id="bg-upload" type="file" accept="image/*" onChange={handleBackgroundUpload} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="char-upload" className="text-sm font-medium">人物图片</label>
          <Input id="char-upload" type="file" accept="image/*" onChange={handleCharacterUpload} />
        </div>
        <Button
          variant="outline"
          onClick={enableSelectionDrawing}
        >
          创建选区 (拖拽)
        </Button>
        <Button
          variant="outline"
          onClick={handleToggleActive}
          className={cn({
            'bg-blue-500 text-white hover:bg-blue-600': isAreaActive,
            'hover:bg-gray-100 dark:hover:bg-gray-700': !isAreaActive,
          })}
        >
          {isAreaActive ? '选区已激活' : '选区未激活'}
        </Button>
        <Button
          variant="outline"
          onClick={clearCanvas}
        >
          清空画布
        </Button>
      </div>
      <div className="relative w-full flex-1 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <canvas
          className="w-full h-full"
          ref={canvasRef}
        />
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        提示：点击非选区区域可以切换选区激活状态
      </div>
    </div>
  )
}
