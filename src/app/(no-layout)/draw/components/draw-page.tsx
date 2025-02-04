'use client'

import dynamic from 'next/dynamic'

export const Excalidraw = dynamic(
  async () => {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    window.EXCALIDRAW_ASSET_PATH = '/'
    return import('@excalidraw/excalidraw').then(mod => mod.Excalidraw)
  },
  {
    ssr: false,
  },
)
