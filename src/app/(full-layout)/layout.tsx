import type { ReactNode } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export default function FullLayout(
  { children }: Readonly<{ children: ReactNode }>,
) {
  return (
    <AppLayout>
      {children}

      {/* 柔和渐变背景 - 亮色模式 */}
      <div
        className="fixed inset-0 -z-10 animate-gradient-breathe dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, hsl(270 50% 88% / 0.95), transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 30%, hsl(280 45% 86% / 0.85), transparent 50%),
            radial-gradient(ellipse 40% 40% at 15% 70%, hsl(260 50% 87% / 0.75), transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 85%, hsl(290 40% 89% / 0.65), transparent 50%)
          `,
        }}
      />

      {/* 柔和渐变背景 - 暗色模式 */}
      <div
        className="fixed inset-0 -z-10 animate-gradient-breathe hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, hsl(270 50% 22% / 0.9), transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 30%, hsl(280 45% 18% / 0.8), transparent 50%),
            radial-gradient(ellipse 40% 40% at 15% 70%, hsl(260 50% 20% / 0.7), transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 85%, hsl(290 40% 19% / 0.6), transparent 50%)
          `,
        }}
      />

      {/* 漂浮光晕装饰 - 亮色模式 */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -z-10 animate-float-slow dark:hidden" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-violet-300/15 rounded-full blur-3xl -z-10 animate-float-medium dark:hidden" />
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl -z-10 animate-float-fast dark:hidden" />

      {/* 漂浮光晕装饰 - 暗色模式 */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-float-slow hidden dark:block" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl -z-10 animate-float-medium hidden dark:block" />
      <div className="fixed top-1/3 right-1/4 w-72 h-72 bg-violet-600/12 rounded-full blur-3xl -z-10 animate-float-fast hidden dark:block" />
      <div className="fixed bottom-1/3 left-1/4 w-56 h-56 bg-fuchsia-600/10 rounded-full blur-3xl -z-10 animate-float-slow hidden dark:block" style={{ animationDelay: '-5s' }} />

      {/* 细腻网格纹理 */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(25 20% 60%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(25 20% 60%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </AppLayout>
  )
}
