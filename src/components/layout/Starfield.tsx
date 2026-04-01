'use client'

import { useEffect, useRef } from 'react'

/**
 * 星空背景组件 —— 纯 Canvas 实现
 * 在暗色模式下绘制密集的随机星星，带有一闪一闪的 twinkle 动画
 * 使用 requestAnimationFrame 驱动，性能开销极低
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    let animationId: number
    let stars: Star[] = []

    interface Star {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      baseOpacity: number
      /** 闪烁相位 */
      phase: number
      /** 闪烁速度 */
      speed: number
      /** 色温偏移: 0 = 纯白, 1 = 暖色, -1 = 冷色 */
      warmth: number
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      generateStars()
    }

    function generateStars() {
      const area = window.innerWidth * window.innerHeight
      // ~1 star per 3000px² → 大约 700 颗左右 (1920x1080)
      const count = Math.floor(area / 3000)
      stars = Array.from({ length: count }, () => {
        const warmth = Math.random() < 0.08
          ? (Math.random() > 0.5 ? 1 : -1)
          : 0

        // 生成一个整体的漂浮方向（大部分星星会顺着微弱的星流移动，但有随机偏差）
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 0.15 + 0.02

        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 1.2 + 0.3,
          baseOpacity: Math.random() * 0.6 + 0.15,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.008 + 0.002, // 很慢的闪烁
          warmth,
        }
      })
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const star of stars) {
        // 微弱漂浮
        star.x += star.vx
        star.y += star.vy

        // 边界平滑消失/重生 (环绕)
        if (star.x < -10)
          star.x = window.innerWidth + 10
        if (star.x > window.innerWidth + 10)
          star.x = -10
        if (star.y < -10)
          star.y = window.innerHeight + 10
        if (star.y > window.innerHeight + 10)
          star.y = -10

        // Twinkle: 正弦波调制透明度
        const twinkle = Math.sin(time * star.speed + star.phase)
        const opacity = Math.max(0, star.baseOpacity + twinkle * star.baseOpacity * 0.6)

        if (opacity <= 0.02)
          continue

        // 根据色温决定颜色
        let r = 255
        let g = 255
        let b = 255
        if (star.warmth > 0) {
          // 暖星: 淡橘/淡黄
          r = 255
          g = 220
          b = 180
        }
        else if (star.warmth < 0) {
          // 冷星: 淡蓝
          r = 200
          g = 215
          b = 255
        }

        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${opacity})`
        ctx!.fill()

        // 亮星加辉光
        if (star.radius > 1.0 && opacity > 0.4) {
          ctx!.beginPath()
          ctx!.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${g},${b},${opacity * 0.08})`
          ctx!.fill()
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    animationId = requestAnimationFrame(draw)

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
