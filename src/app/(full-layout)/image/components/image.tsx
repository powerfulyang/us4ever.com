'use client'

import type { Image as ImageResponse } from '@/server/api/routers/asset'
import { motion, useInView } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'

interface BaseImageProps {
  className?: string
}

interface ImageWithIdProps extends BaseImageProps {
  id: string
}

interface ImageWithDataProps extends BaseImageProps {
  image: ImageResponse
  showCompressed?: boolean
}

// 基础图片渲染组件
function BaseAssetImage({ image, className, showCompressed }: ImageWithDataProps) {
  const [isHighResLoaded, setIsHighResLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(image.thumbnail_10x_url)

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, {
    once: true,
  })

  const highResUrl = useMemo(() => {
    if (showCompressed) {
      return image.compressed_url
    }
    return image.thumbnail_320x_url
  }, [image.compressed_url, image.thumbnail_320x_url, showCompressed])

  useEffect(() => {
    if (inView && highResUrl) {
      // 预加载高清图片
      const img = new Image()
      img.src = highResUrl
      img.onload = () => {
        setIsHighResLoaded(true)
        setCurrentSrc(highResUrl)
      }
      return () => {
        img.onload = null
      }
    }
  }, [highResUrl, inView])

  return (
    <div title={image.description} className={cn('relative w-full h-full overflow-hidden')} ref={ref}>
      <motion.img
        src={currentSrc}
        alt={image.description}
        className={cn('w-full h-full', className)}
        animate={{
          filter: isHighResLoaded ? 'blur(0px)' : 'blur(10px)',
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

// 通过 ID 加载图片的组件
export function AssetImageWithId({ id, className }: ImageWithIdProps) {
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
