'use client'

import type { WalineInitOptions } from '@waline/client'
import {
  init,
} from '@waline/client'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

import { useEffect, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null!)
  const walineInstanceRef = useRef<ReturnType<typeof init> | null>(null)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!walineInstanceRef.current) {
      walineInstanceRef.current = init({
        ...props,
        el: containerRef.current,
        path: pathname,
        lang: 'zh-CN',
        dark: resolvedTheme === 'dark',
        serverURL: 'https://waline.us4ever.com',
        emoji,
        reaction,
      })
    }
    else {
      walineInstanceRef.current.update({
        ...props,
        path: pathname,
        lang: 'zh-CN',
        dark: resolvedTheme === 'dark',
        serverURL: 'https://waline.us4ever.com',
        emoji,
        reaction,
      })
    }
  }, [pathname, resolvedTheme, props])

  useEffect(() => {
    return () => {
      walineInstanceRef.current?.destroy()
      walineInstanceRef.current = null
    }
  }, [])

  return <div ref={containerRef} />
}
