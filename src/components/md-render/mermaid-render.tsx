'use client'

import mermaid from 'mermaid'
import { useEffect } from 'react'
import { useEffectOnce } from 'react-use'

export default function MermaidRender({ source }: { source: string }) {
  useEffectOnce(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'forest',
      fontFamily: 'Fira Code, LXGW, sans-serif',
    })
  })

  useEffect(() => {
    if (source) {
      void mermaid.run({
        querySelector: '.mermaid',
      })
    }
  }, [source])

  return null
}
