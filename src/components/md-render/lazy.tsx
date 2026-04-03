'use client'

import type { ComponentProps } from 'react'
import dynamic from 'next/dynamic'

// 动态导入 MermaidDiagram，禁用 SSR
const MermaidDiagram = dynamic(
  () => import('./mermaid-render'),
  { ssr: false },
)

export function LazyMermaidDiagram(props: ComponentProps<typeof MermaidDiagram>) {
  return <MermaidDiagram {...props} />
}

// 兼容旧的导出名称（已废弃，建议使用 LazyMermaidDiagram）
/** @deprecated Use LazyMermaidDiagram instead */
export function LazyMermaidRender(props: ComponentProps<typeof LazyMermaidDiagram>) {
  return <LazyMermaidDiagram {...props} />
}
