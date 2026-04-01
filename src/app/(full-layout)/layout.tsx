import type { ReactNode } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { LightParticles } from '@/components/layout/LightParticles'
import { Starfield } from '@/components/layout/Starfield'

export default function FullLayout(
  { children }: Readonly<{ children: ReactNode }>,
) {
  return (
    <>
      {/* ✨ 动态粒子背景 - 亮色模式 (Canvas 动画) */}
      <div className="fixed inset-0 z-0 light-mode-only pointer-events-none">
        <LightParticles />
      </div>

      {/* ✨ 星空背景 - 暗色模式 (Canvas 动画) */}
      <div className="fixed inset-0 z-0 dark-mode-only pointer-events-none">
        <Starfield />
      </div>

      <div className="relative z-10">
        <AppLayout>
          {children}
        </AppLayout>
      </div>
    </>
  )
}
