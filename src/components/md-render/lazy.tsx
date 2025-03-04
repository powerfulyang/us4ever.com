'use client'

import dynamic from 'next/dynamic'

export const LazyMermaidRender = dynamic(
  () => import('./mermaid-render'),
  { ssr: false },
)
