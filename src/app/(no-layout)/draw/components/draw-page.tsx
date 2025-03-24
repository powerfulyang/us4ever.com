'use client'

import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

export const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
  },
)
