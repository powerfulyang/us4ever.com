'use client'

import { useIsomorphicLayoutEffect } from 'framer-motion'
import mermaid from 'mermaid'

export default function MermaidRender({ source }: { source: string }) {
  const [isInitialized, setIsInitialized] = useState(false)
  useIsomorphicLayoutEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'forest',
      fontFamily: 'inherit',
    })
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (source && isInitialized) {
      void mermaid.run({
        querySelector: '.mermaid',
      })
    }
  }, [isInitialized, source])

  return null
}
