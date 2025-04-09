'use client'

import type { Image as ImageResponse } from '@/server/api/routers/asset'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface BaseImageProps {
  className?: string
}

interface ImageWithIdProps extends BaseImageProps {
  id: string
}

interface ImageWithDataProps extends BaseImageProps {
  image: ImageResponse
}

// 基础图片渲染组件
function BaseAssetImage({ image, className }: ImageWithDataProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, {
    once: true,
  })

  useEffect(() => {
    if (inView) {
      if (image?.thumbnail_320x_url) {
        const img = new Image()
        img.src = image.thumbnail_320x_url
        img.onload = () => setIsImageLoaded(true)
        return () => {
          img.onload = null
        }
      }
    }
  }, [image.thumbnail_320x_url, inView])

  return (
    <div className={cn('relative w-full h-full overflow-hidden')} ref={ref}>
      <AnimatePresence mode="wait">
        {/* 模糊预览图 */}
        {!isImageLoaded && (
          <motion.img
            loading="lazy"
            key="blur"
            className={cn('w-full h-full', className)}
            src={image.thumbnail_10x_url}
            alt={image.name}
            initial={{ filter: 'blur(10px)' }}
            exit={{ filter: 'blur(5px)' }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* 高清图 */}
        {isImageLoaded && (
          <motion.img
            loading="lazy"
            key="full"
            src={image.thumbnail_320x_url}
            alt={image.name}
            className={cn('w-full h-full', className)}
            initial={{ filter: 'blur(5px)' }}
            animate={{ filter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 通过 ID 加载图片的组件
export function AssetImage({ id, className }: ImageWithIdProps) {
  const { data: image, isPending } = api.asset.getImageById.useQuery({ id })

  if (isPending) {
    return (
      <motion.div
        className={cn('relative aspect-square bg-gray-100', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>
    )
  }

  if (!image) {
    return (
      <motion.div
        className={cn('relative aspect-square bg-gray-100 flex items-center justify-center', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-sm text-gray-400">图片不存在</span>
      </motion.div>
    )
  }

  return <BaseAssetImage image={image} className={className} />
}

// 导出基础组件供直接使用图片数据的场景
export { BaseAssetImage as AssetImageWithData }
