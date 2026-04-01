import type { ReactNode } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Starfield } from '@/components/layout/Starfield'

export default function FullLayout(
  { children }: Readonly<{ children: ReactNode }>,
) {
  return (
    <>
      {/* ✨ 星空背景 - 暗色模式 (Canvas 动画) */}
      <div className="fixed inset-0 z-0 dark-mode-only pointer-events-none">
        <Starfield />
      </div>

      <div className="relative z-10">
        <AppLayout>
          {children}

          {/* 柔和渐变背景 - 亮色模式 */}
          <div
            className="fixed inset-0 -z-10 animate-gradient-breathe light-mode-only"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 50% 0%, hsl(270 50% 88% / 0.95), transparent 60%),
                radial-gradient(ellipse 50% 50% at 85% 30%, hsl(280 45% 86% / 0.85), transparent 50%),
                radial-gradient(ellipse 40% 40% at 15% 70%, hsl(260 50% 87% / 0.75), transparent 50%),
                radial-gradient(ellipse 60% 40% at 70% 85%, hsl(290 40% 89% / 0.65), transparent 50%)
              `,
            }}
          />

          {/* 漂浮光晕装饰 - 亮色模式 */}
          <div className="fixed top-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -z-10 animate-float-slow light-mode-only" />
          <div className="fixed bottom-20 right-10 w-80 h-80 bg-violet-300/15 rounded-full blur-3xl -z-10 animate-float-medium light-mode-only" />
          <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl -z-10 animate-float-fast light-mode-only" />

          {/* 细腻网格纹理 - 仅亮色模式 */}
          <div
            className="fixed inset-0 -z-10 opacity-[0.03] light-mode-only"
            style={{
              backgroundImage: `
                linear-gradient(hsl(25 20% 60%) 1px, transparent 1px),
                linear-gradient(90deg, hsl(25 20% 60%) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </AppLayout>
      </div>
    </>
  )
}
