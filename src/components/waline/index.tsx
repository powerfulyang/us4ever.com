'use client'

import type { WalineInitOptions, WalineInstance } from '@waline/client'
import {
  init,
} from '@waline/client'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { useEffectOnce } from 'react-use'
import '@waline/client/style'

export type WalineOptions = Partial<Omit<WalineInitOptions, 'el'> & { path: string }>

const emoji = [
  '/waline/emoji/weibo',
  '/waline/emoji/tieba',
  '/waline/emoji/qq',
  '/waline/emoji/bilibili',
  '/waline/emoji/alus',
].map(x => `https://littleeleven.com${x}` as const)

const reaction = [
  '/waline/reaction/clear-day.svg',
  '/waline/reaction/dust-day.svg',
  '/waline/reaction/extreme-haze.svg',
  '/waline/reaction/dust-wind.svg',
  '/waline/reaction/extreme-snow.svg',
  '/waline/reaction/hurricane.svg',
  '/waline/reaction/starry-night.svg',
].map(x => `https://littleeleven.com${x}`)

export function Waline(props: WalineOptions) {
  const walineInstanceRef = useRef<WalineInstance | null>(null)
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffectOnce(() => {
    walineInstanceRef.current = init({
      el: containerRef.current,
      lang: 'zh-CN',
      dark: true,
      serverURL: 'https://waline.us4ever.com',
      emoji,
      reaction,
    })

    return () => {
      walineInstanceRef.current?.destroy()
      walineInstanceRef.current = null // 清理引用
    }
  })

  const pathname = usePathname()

  useEffect(() => {
    walineInstanceRef.current?.update({
      ...props,
      path: pathname,
    })
  }, [pathname, props])

  return <div ref={containerRef} />
}
