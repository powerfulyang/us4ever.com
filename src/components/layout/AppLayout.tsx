'use client'

import { AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import * as React from 'react'
import { logout } from '@/app/actions'
import { CommandPalette } from '@/components/command-palette'
import { Sidebar } from '@/components/layout/Sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import UserIcon from '@/components/user/icon'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  return (
    <div className="min-h-screen">
      {/* 侧边栏 */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* 主内容区域 */}
      <div
        className={cn(
          'fixed inset-0 transition-all duration-200 ease-out overflow-hidden',
          sidebarCollapsed ? 'ml-14' : 'ml-60',
        )}
      >
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 h-14 bg-transparent backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between h-full px-4">
            {/* 搜索按钮 */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 w-64',
                'bg-muted/50 hover:bg-muted',
                'text-sm text-muted-foreground',
                'transition-colors',
              )}
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">搜索...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background">
                <span className="text-xs">⌘</span>
                K
              </kbd>
            </button>

            {/* 右侧操作 */}
            <div className="flex items-center gap-2">
              <UserIcon onLogoutAction={logout} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>

      {/* 命令面板 */}
      <AnimatePresence>
        {commandOpen && (
          <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        )}
      </AnimatePresence>
    </div>
  )
}
