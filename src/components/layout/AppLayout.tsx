'use client'

import { AnimatePresence } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { logout } from '@/app/actions'
import { CommandPalette } from '@/components/command-palette'
import { ThemeToggle } from '@/components/theme-toggle'
import UserIcon from '@/components/user/icon'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)

  return (
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-background/30 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          {/* 左侧：首页链接 + 搜索 */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50',
                'bg-muted/30 hover:bg-muted/60',
                'text-sm text-muted-foreground',
                'transition-colors w-56',
              )}
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">搜索...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70 bg-muted/50 rounded">
                <span className="text-xs">⌘</span>
                K
              </kbd>
            </button>
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            <UserIcon onLogoutAction={logout} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 页面内容 */}
      <main className="flex-1 flex flex-col p-6 overflow-y-auto pt-20">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* 命令面板 */}
      <AnimatePresence>
        {commandOpen && (
          <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        )}
      </AnimatePresence>
    </div>
  )
}
