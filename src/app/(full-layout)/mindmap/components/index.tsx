'use client'

import { useEffect, useRef, useState } from 'react'
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
import { CustomNoteContent } from '@/app/(full-layout)/mindmap/components/CustomNoteContent'
import { SaveButton } from '@/app/(full-layout)/mindmap/components/save-button'
import { useMindMapNoteStore } from '@/store/mind-map-note'

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
  id?: string
  isPublic?: boolean
}

export default function MindMapView({ data, editable, id, isPublic = false }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<MindMap | null>(null)
  const { showNote } = useMindMapNoteStore()
  const [hasChanges, setHasChanges] = useState(false)
  const [currentData, setCurrentData] = useState(data)

  useEffect(() => {
    mindMapRef.current = new MindMap({
      el: containerRef.current,
      theme: 'classic13',
      layout: 'mindMap',
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
      openRealtimeRenderOnNodeTextEdit: true,
      enableAutoEnterTextEditWhenKeydown: true,
      readonly: !editable,
    } as never)

    // 添加数据变化监听
    if (editable && mindMapRef.current) {
      mindMapRef.current.on('node_tree_render_end', () => {
        setHasChanges(true)
        if (mindMapRef.current) {
          const newData = mindMapRef.current.getData(null)
          setCurrentData(newData)
        }
      })
    }

    return () => {
      mindMapRef.current?.destroy()
    }
  }, [editable, showNote])

  useEffect(() => {
    if (data) {
      mindMapRef.current?.setData(data)
    }
  }, [data])

  return (
    <>
      <div className="relative w-full h-full">
        <div ref={containerRef} className="w-full h-full" />
        {editable && id && (
          <div className="absolute top-4 right-4 z-10">
            <SaveButton
              id={id}
              isPublic={isPublic}
              title={currentData?.root?.data?.text || '未命名思维导图'}
              content={currentData}
              disabled={!hasChanges}
            />
          </div>
        )}
      </div>
      <CustomNoteContent />
    </>
  )
}
