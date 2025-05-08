import type { RefObject } from 'react'
import { Canvas, FabricImage, Point, Rect } from 'fabric'
import { useCallback, useEffect, useRef, useState } from 'react'

// 为了简化类型问题，使用any类型的事件处理程序
type AnyEvent = any

export function useImageEditor(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [selectionArea, setSelectionArea] = useState<Rect | null>(null)

  // 选区绘制状态
  const [isDrawingSelectionMode, setIsDrawingSelectionMode] = useState<boolean>(false)
  // 选区是否激活（限制人物在选区内）
  const [isAreaActive, setIsAreaActive] = useState<boolean>(false)
  // 使用 ref 记录绘制起点
  const selectionOrigin = useRef<Point | null>(null)
  // 临时选区矩形
  const tempSelectionRect = useRef<Rect | null>(null)

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) {
      console.warn('Canvas 引用不可用')
      return undefined
    }
    const newCanvas = new Canvas(canvasRef.current, {
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
      backgroundColor: '#f0f0f0',
    })
    setCanvas(newCanvas)

    return () => {
      void newCanvas.dispose()
      setCanvas(null)
    }
  }, [canvasRef])

  // 监听画布容器大小变化
  useEffect(() => {
    if (!canvas || !canvasRef.current?.parentElement)
      return

    const parentElement = canvasRef.current.parentElement
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (canvas && canvas.wrapperEl) {
          canvas.setDimensions({ width, height })
          canvas.renderAll()
        }
      }
    })
    resizeObserver.observe(parentElement)
    return () => resizeObserver.disconnect()
  }, [canvas, canvasRef])

  // 单击事件处理：单击非选区区域来切换激活状态
  useEffect(() => {
    if (!canvas)
      return

    const handleCanvasClick = (opt: AnyEvent) => {
      // 如果正在绘制选区或者没有选区，不处理
      if (isDrawingSelectionMode || !selectionArea)
        return

      const target = opt.target
      // 如果点击了选区自身，不改变激活状态
      if (target === selectionArea)
        return

      // 点击非选区区域，切换激活状态
      setIsAreaActive(prev => !prev)
    }

    canvas.on('mouse:down', handleCanvasClick)

    return () => {
      canvas.off('mouse:down', handleCanvasClick)
    }
  }, [canvas, isDrawingSelectionMode, selectionArea])

  // 选区绘制功能
  useEffect(() => {
    if (!canvas)
      return

    if (!isDrawingSelectionMode) {
      canvas.defaultCursor = 'default'
      return
    }

    // 进入绘制模式
    canvas.defaultCursor = 'crosshair'
    canvas.selection = false // 禁用默认选择

    const handleMouseDown = (opt: AnyEvent) => {
      if (!isDrawingSelectionMode || !canvas)
        return
      const pointer = canvas.getViewportPoint(opt.e)
      selectionOrigin.current = new Point(pointer.x, pointer.y)

      // 移除已有的临时选区
      if (tempSelectionRect.current) {
        canvas.remove(tempSelectionRect.current)
      }

      // 创建新的临时选区
      tempSelectionRect.current = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'rgba(100, 100, 255, 0.2)',
        stroke: 'blue',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      })

      canvas.add(tempSelectionRect.current)
    }

    const handleMouseMove = (opt: AnyEvent) => {
      if (!isDrawingSelectionMode || !canvas || !selectionOrigin.current || !tempSelectionRect.current)
        return

      const pointer = canvas.getViewportPoint(opt.e)
      const origin = selectionOrigin.current

      // 计算选区尺寸和位置
      const width = Math.abs(pointer.x - origin.x)
      const height = Math.abs(pointer.y - origin.y)
      const left = Math.min(pointer.x, origin.x)
      const top = Math.min(pointer.y, origin.y)

      // 更新临时选区
      tempSelectionRect.current.set({
        left,
        top,
        width,
        height,
      })

      canvas.renderAll()
    }

    const handleMouseUp = () => {
      if (!isDrawingSelectionMode || !canvas || !selectionOrigin.current || !tempSelectionRect.current)
        return

      // 如果选区太小，则忽略
      if (tempSelectionRect.current.width < 10 || tempSelectionRect.current.height < 10) {
        canvas.remove(tempSelectionRect.current)
        tempSelectionRect.current = null
        selectionOrigin.current = null
        canvas.renderAll()
        return
      }

      // 移除旧的选区
      if (selectionArea) {
        canvas.remove(selectionArea)
      }

      // 创建最终选区
      const finalRect = new Rect({
        left: tempSelectionRect.current.left,
        top: tempSelectionRect.current.top,
        width: tempSelectionRect.current.width,
        height: tempSelectionRect.current.height,
        fill: 'rgba(100, 100, 255, 0.2)',
        stroke: 'blue',
        strokeWidth: 1,
        selectable: true, // 可选择
        hasControls: true, // 显示控制手柄
        hasBorders: true,
        lockRotation: true, // 锁定旋转以简化
      })

      // 移除临时选区
      canvas.remove(tempSelectionRect.current)
      tempSelectionRect.current = null
      selectionOrigin.current = null

      // 添加最终选区
      canvas.add(finalRect)
      try {
        // 尝试置顶，如果类型错误则忽略
        (finalRect as any).bringToFront()
      }
      catch (e) {
        console.warn('无法将选区置顶', e)
      }

      canvas.setActiveObject(finalRect)
      setSelectionArea(finalRect)
      setIsDrawingSelectionMode(false) // 退出绘制模式

      // 初始时选区处于激活状态
      setIsAreaActive(true)

      canvas.renderAll()
    }

    // 注册事件处理
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      if (canvas) {
        canvas.off('mouse:down', handleMouseDown)
        canvas.off('mouse:move', handleMouseMove)
        canvas.off('mouse:up', handleMouseUp)
        canvas.defaultCursor = 'default'
        canvas.selection = true // 恢复默认选择

        // 清理临时选区
        if (tempSelectionRect.current) {
          canvas.remove(tempSelectionRect.current)
          tempSelectionRect.current = null
        }
      }
    }
  }, [canvas, isDrawingSelectionMode, selectionArea])

  // 添加背景图片
  const addBackgroundImage = useCallback(async (url: string) => {
    if (!canvas)
      return
    try {
      const img = await FabricImage.fromURL(url)
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const imgWidth = img.width
      const imgHeight = img.height

      // 计算缩放以适应画布
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
      img.scale(scale)

      // 居中显示
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      })

      canvas.add(img)

      // 尝试将背景图置底
      try {
        (img as any).sendToBack()
      }
      catch (e) {
        console.warn('无法将背景图置底', e)
      }

      canvas.renderAll()
    }
    catch (e) {
      console.error('加载背景图片失败:', e)
    }
  }, [canvas])

  // 添加人物图片
  const addCharacterImage = useCallback(async (url: string) => {
    if (!canvas)
      return
    try {
      const img = await FabricImage.fromURL(url)
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const imgWidth = img.width
      const imgHeight = img.height

      // 设置初始大小为画布的30%
      const maxSize = Math.min(canvasWidth, canvasHeight) * 0.3
      const scale = Math.min(maxSize / imgWidth, maxSize / imgHeight)
      img.scale(scale)

      // 居中显示
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        hasControls: true,
        hasBorders: true,
        originX: 'left',
        originY: 'top',
      })
      img.setControlsVisibility({ mb: false, ml: false, mt: false, mr: false })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }
    catch (e) {
      console.error('加载人物图片失败:', e)
    }
  }, [canvas])

  // 进入绘制选区模式
  const enableSelectionDrawing = useCallback(() => {
    if (!canvas)
      return

    // 取消当前激活对象
    canvas.discardActiveObject()
    canvas.renderAll()

    // 进入绘制模式
    setIsDrawingSelectionMode(true)

    // 如果已有选区，先移除它
    if (selectionArea) {
      canvas.remove(selectionArea)
      setSelectionArea(null)
      setIsAreaActive(false)
    }
  }, [canvas, selectionArea])

  // 根据激活状态更新限制
  useEffect(() => {
    if (!canvas) {
      return
    }

    canvas.getObjects().forEach((obj) => {
      if (obj instanceof FabricImage) {
        const img = obj
        // 仅对 selectable 的图像 (角色图像) 应用 clipPath逻辑
        if (img.selectable) {
          if (isAreaActive && selectionArea) {
            // 如果选区激活且存在，则应用 clipPath
            img.clipPath = selectionArea
            img.clipPath.set({ absolutePositioned: true }) // 确保 clipPath 的位置是绝对的
            img.clipPath.setCoords() // 更新 clipPath 的坐标
          }
          else {
            // 如果选区未激活或不存在，则移除角色图片的 clipPath
            img.clipPath = undefined
          }
        }
      }
    })

    // Ensure selectionArea coordinates are up-to-date for its own rendering/interaction
    if (selectionArea && isAreaActive) {
      selectionArea.setCoords()
    }

    canvas.renderAll()
  }, [canvas, selectionArea, isAreaActive])

  // 清空画布
  const clearCanvas = useCallback(() => {
    if (!canvas)
      return
    canvas.remove(...canvas.getObjects())
    canvas.backgroundColor = '#f0f0f0'
    canvas.renderAll()
    setSelectionArea(null)
    setIsDrawingSelectionMode(false)
    setIsAreaActive(false)
  }, [canvas])

  return {
    initCanvas,
    addBackgroundImage,
    addCharacterImage,
    enableSelectionDrawing,
    isAreaActive, // 导出激活状态，用于UI显示
    setIsAreaActive, // 导出设置激活状态的方法
    clearCanvas,
  }
}
