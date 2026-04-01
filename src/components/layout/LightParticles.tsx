'use client'

import { useEffect, useRef } from 'react'

/**
 * 亮色模式动态背景组件 —— 纯 Canvas 实现
 * 缓慢漂浮的柔和微粒/光斑，呈现轻盈的技术感与空间感
 */
export function LightParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    let animationId: number
    let particles: Particle[] = []

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      baseOpacity: number
      phase: number
      speed: number
    }

    // 几款马卡龙/清新色系，在亮色模式下看起来干净舒缓
    const colors = [
      '147, 197, 253', // blue-300
      '216, 180, 254', // purple-300
      '253, 186, 116', // orange-300
      '134, 239, 172', // green-300
    ]

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      generateParticles()
    }

    function generateParticles() {
      const area = window.innerWidth * window.innerHeight
      // 增加粒子密度：大概 150~250 颗（视屏幕尺寸），并加入大小深浅层次
      const count = Math.floor(area / 8000)
      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 0.2 + 0.05
        // 10% 的概率是大一点的失焦虚影光斑，增强层次感
        const isLarge = Math.random() > 0.9
        const baseRadius = isLarge ? Math.random() * 6 + 3 : Math.random() * 2.5 + 1.5

        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: baseRadius,
          color: colors[Math.floor(Math.random() * colors.length)]!,
          baseOpacity: Math.random() * 0.4 + 0.1,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.01 + 0.005,
        }
      })
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const p of particles) {
        // 缓慢移动
        p.x += p.vx
        p.y += p.vy

        // 边界环绕
        if (p.x < -10)
          p.x = window.innerWidth + 10
        if (p.x > window.innerWidth + 10)
          p.x = -10
        if (p.y < -10)
          p.y = window.innerHeight + 10
        if (p.y > window.innerHeight + 10)
          p.y = -10

        const pulse = Math.sin(time * p.speed + p.phase)
        const opacity = Math.max(0, p.baseOpacity + pulse * p.baseOpacity * 0.4)

        // 绘制粒子核心
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.color}, ${opacity})`
        ctx!.fill()

        // 绘制柔和光晕
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.color}, ${opacity * 0.25})`
        ctx!.fill()
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
