'use client'

import { CustomNoteContent } from '@/components/mindmap/CustomNoteContent'
import { useNoteStore } from '@/store/note'
import { useEffect, useRef } from 'react'
import MindMap from 'simple-mind-map'
import Themes from 'simple-mind-map-plugin-themes'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import MindMapLayoutPro from 'simple-mind-map/src/plugins/MindMapLayoutPro.js'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
// import RichText from 'simple-mind-map/src/plugins/RichText.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'

// 注册插件
// eslint-disable-next-line react-hooks/rules-of-hooks
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(Demonstrate)
  .usePlugin(OuterFrame)
  .usePlugin(MindMapLayoutPro)
  // .usePlugin(RichText)
// 注册主题
Themes.init(MindMap)

interface MindMapProps {
  data: any
  editable?: boolean
}

export default function MindMapView({ data, editable }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<MindMap | null>(null)
  const { showNote } = useNoteStore()

  useEffect(() => {
    mindMapRef.current = new MindMap({
      el: containerRef.current,
      theme: 'classic13',
      layout: 'mindMap',
      fit: true,
      nodeTextEditZIndex: 1000,
      nodeNoteTooltipZIndex: 1000,
      customNoteContentShow: {
        show: (content: string, left: number, top: number, node: any) => {
          showNote(content, left, top, node)
        },
        hide: () => {
          //
        },
      },
      openPerformance: true,
      openRealtimeRenderOnNodeTextEdit: true,
      enableAutoEnterTextEditWhenKeydown: true,
      readonly: !editable,
    } as never)

    return () => {
      mindMapRef.current?.destroy()
    }
  }, [showNote])

  useEffect(() => {
    if (data) {
      mindMapRef.current?.setData(data)
    }
  }, [data])

  return (
    <>
      <div ref={containerRef} className="w-full h-full min-h-100dvh" />
      <CustomNoteContent />
    </>
  )
}
