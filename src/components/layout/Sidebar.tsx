'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Home,
  MessageCircle,
  Network,
  Settings,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

const mainNavItems: NavItem[] = [
  { title: '首页', href: '/', icon: Home },
  { title: '笔记本', href: '/keep', icon: BookOpen },
  { title: '待办事项', href: '/todo', icon: CheckSquare },
  { title: '动态', href: '/moment', icon: MessageCircle },
  { title: '思维导图', href: '/mindmap', icon: Network },
  { title: '图片管理', href: '/image', icon: FileImage },
]

const toolNavItems: NavItem[] = [
  { title: 'TTS', href: '/tts', icon: Zap },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/')
      return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 z-40 h-screen flex flex-col overflow-hidden"
    >
      {/* 背景层 - 紫色调渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background-secondary to-background-tertiary dark:from-background dark:via-background dark:to-background-tertiary" />

      {/* 紫色光晕装饰 */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/5 to-transparent dark:from-purple-500/10 pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-400/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 边框 */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-border via-border to-transparent" />

      {/* Header */}
      <div className="relative h-14 flex items-center justify-between px-3 border-b border-border/50">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="font-semibold text-sm"
            >
              us4ever
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {/* Main Section */}
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 h-9 px-2.5 rounded-md text-sm transition-all duration-200 relative group',
                  active
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-r-full shadow-sm shadow-purple-500/20"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors duration-200',
                  active ? 'text-purple-600 dark:text-purple-400' : 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
                )}
                />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.1 }}
                      className="truncate"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>

        {/* Tools Section */}
        {!collapsed && (
          <div className="mt-6 mb-2">
            <div className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              工具
            </div>
          </div>
        )}

        <div className="space-y-0.5">
          {toolNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 h-9 px-2.5 rounded-md text-sm transition-all duration-200 relative group',
                  active
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicatorTools"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-r-full shadow-sm shadow-purple-500/20"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors duration-200',
                  active ? 'text-purple-600 dark:text-purple-400' : 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
                )}
                />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.1 }}
                      className="truncate"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 h-9 px-2.5 rounded-md text-sm transition-colors',
            isActive('/profile')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.1 }}
                className="truncate"
              >
                设置
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  )
}
