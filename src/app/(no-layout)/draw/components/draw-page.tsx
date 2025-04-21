'use client'

import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

export const Excalidraw = dynamic(
  async () => {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    window.EXCALIDRAW_ASSET_PATH = '/excalidraw/'
    return (await import('@excalidraw/excalidraw')).Excalidraw
  },
  {
    ssr: false,
  },
)
