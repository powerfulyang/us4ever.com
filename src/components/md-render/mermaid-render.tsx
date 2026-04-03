'use client'

import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import mermaid from 'mermaid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'

import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface MermaidDiagramProps {
  /** mermaid 图表源码 */
  code: string
  /** 唯一标识符（用于生成渲染 ID） */
  id?: string
  /** 是否显示缩放控制 */
  showZoomControls?: boolean
  /** 初始缩放比例 */
  initialZoom?: number
  /** 容器最大高度 */
  maxHeight?: number
}

const ZOOM_STEP = 0.25
const MIN_ZOOM = 0.25

interface ControlBarProps {
  isFullscreen: boolean
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  toggleFullscreen: () => void
}

function ControlBar({
  isFullscreen,
  zoom,
  zoomIn,
  zoomOut,
  resetZoom,
  toggleFullscreen,
}: ControlBarProps) {
  return (
    <div className={cn(
      'flex items-center gap-1',
      isFullscreen
        ? 'p-2 border-b bg-background/80 backdrop-blur-sm'
        : 'absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm rounded-md p-1 shadow-md border',
    )}
    >
      <Button variant="ghost" size="xs" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} title="缩小">
        <ZoomOut className={cn('h-3.5 w-3.5', isFullscreen && 'h-4 w-4')} />
      </Button>
      <span className="text-xs text-muted-foreground min-w-[3rem] text-center select-none">
        {Math.round(zoom * 100)}
        %
      </span>
      <Button variant="ghost" size="xs" onClick={zoomIn} title="放大">
        <ZoomIn className={cn('h-3.5 w-3.5', isFullscreen && 'h-4 w-4')} />
      </Button>
      <Button variant="ghost" size="xs" onClick={resetZoom} title="重置">
        <RotateCcw className={cn('h-3.5 w-3.5', isFullscreen && 'h-4 w-4')} />
      </Button>
      <Button variant="ghost" size="xs" onClick={toggleFullscreen} title={isFullscreen ? '退出全屏' : '全屏'}>
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

/**
 * 单个 Mermaid 图表渲染组件
 * 使用 mermaid.render() API 直接渲染
 * 支持缩放、重置、全屏等功能
 */
export default function MermaidDiagram({
  code,
  id,
  showZoomControls = true,
  initialZoom = 1,
  maxHeight = 400,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [renderId] = useState(() => id || `mermaid-${Math.random().toString(36).slice(2, 9)}`)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [zoom, setZoom] = useState(initialZoom)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 })

  // 全局初始化 mermaid（只执行一次）
  useEffectOnce(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'forest',
      fontFamily: 'Fira Code, LXGW, sans-serif',
    })
    setIsInitialized(true)
  })

  // 缩放控制函数
  const zoomIn = useCallback(() => setZoom(prev => prev + ZOOM_STEP), [])
  const zoomOut = useCallback(() => setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM)), [])
  const resetZoom = useCallback(() => setZoom(initialZoom), [initialZoom])

  // 全屏控制 - 使用浏览器 Fullscreen API
  const toggleFullscreen = useCallback(async () => {
    const el = rootRef.current
    if (!el)
      return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setZoom(initialZoom)
      }
      else {
        await el.requestFullscreen()
        setZoom(1)
      }
    }
    catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [initialZoom])

  // 监听全屏状态变化
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current)
    }

    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // 渲染图表
  useEffect(() => {
    if (!isInitialized || !code || !containerRef.current)
      return

    const renderDiagram = async () => {
      try {
        containerRef.current!.innerHTML = ''

        const { svg, bindFunctions } = await mermaid.render(renderId, code)

        containerRef.current!.innerHTML = svg

        if (bindFunctions && containerRef.current) {
          bindFunctions(containerRef.current)
        }

        // 获取 SVG 尺寸
        requestAnimationFrame(() => {
          const svgEl = containerRef.current?.querySelector('svg')
          if (!svgEl)
            return

          const viewBox = svgEl.getAttribute('viewBox')
          if (viewBox) {
            const parts = viewBox.split(' ')
            const width = Number.parseFloat(parts[2] ?? '800') || 800
            const height = Number.parseFloat(parts[3] ?? '600') || 600
            setSvgSize({ width, height })
          }
          else {
            const width = Number.parseFloat(svgEl.getAttribute('width') ?? '') || svgEl.clientWidth || 800
            const height = Number.parseFloat(svgEl.getAttribute('height') ?? '') || svgEl.clientHeight || 600
            setSvgSize({ width, height })
          }
        })

        setError(null)
      }
      catch (err) {
        console.error('Mermaid render error:', err)
        setError(err instanceof Error ? err.message : 'Mermaid 渲染失败')
        containerRef.current!.innerHTML = `<pre class="mermaid-error">${code}</pre>`
      }
    }

    void renderDiagram()
  }, [code, renderId, isInitialized])

  // 应用缩放
  useEffect(() => {
    const svgEl = containerRef.current?.querySelector('svg')
    if (!svgEl || svgSize.width === 0)
      return

    svgEl.setAttribute('width', String(svgSize.width * zoom))
    svgEl.setAttribute('height', String(svgSize.height * zoom))
    svgEl.style.transition = 'width 0.15s ease-out, height 0.15s ease-out'
  }, [zoom, svgSize])

  if (error) {
    return (
      <div className="flex justify-center items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <pre className="text-sm text-red-400 whitespace-pre-wrap">{code}</pre>
      </div>
    )
  }

  // 滚轮处理
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
    if (e.ctrlKey) {
      e.preventDefault()
      if (e.deltaY < 0)
        zoomIn()
      else zoomOut()
    }
  }

  const controlBar = (
    <ControlBar
      isFullscreen={isFullscreen}
      zoom={zoom}
      zoomIn={zoomIn}
      zoomOut={zoomOut}
      resetZoom={resetZoom}
      toggleFullscreen={toggleFullscreen}
    />
  )

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative',
        isFullscreen && 'fixed inset-0 z-50 bg-background flex flex-col',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 全屏模式控制栏 */}
      {isFullscreen && (
        <div className="flex items-center justify-between px-4 shrink-0">
          <span className="text-sm text-muted-foreground select-none">Mermaid 图表</span>
          {controlBar}
        </div>
      )}

      {/* 悬浮控制 - 正常模式 */}
      {showZoomControls && isHovered && !isFullscreen && controlBar}

      {/* 图表容器 */}
      <div
        className={cn(
          'overflow-auto border rounded-lg bg-muted/20',
          isFullscreen && 'flex-1 rounded-none border-0',
        )}
        style={!isFullscreen ? { maxHeight } : undefined}
        onWheel={handleWheel}
      >
        <div className="inline-block p-2">
          <div ref={containerRef} className="mermaid-container" />
        </div>
      </div>
    </div>
  )
}
