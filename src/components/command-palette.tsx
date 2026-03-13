'use client'

import { Command } from 'cmdk'
import {
  BookOpen,
  CheckSquare,
  FileImage,
  Home,
  MessageCircle,
  Moon,
  Network,
  Search,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  keywords?: string[]
  shortcut?: string
  action?: () => void
  href?: string
  section?: string
}

const navigationItems: CommandItem[] = [
  { id: 'home', title: '首页', icon: Home, href: '/', keywords: ['home', 'index'] },
  { id: 'keep', title: '笔记本', icon: BookOpen, href: '/keep', keywords: ['note', 'keep', '笔记'] },
  { id: 'todo', title: '待办事项', icon: CheckSquare, href: '/todo', keywords: ['todo', 'task', '待办'] },
  { id: 'moment', title: '动态', icon: MessageCircle, href: '/moment', keywords: ['moment', 'dynamic', '动态'] },
  { id: 'mindmap', title: '思维导图', icon: Network, href: '/mindmap', keywords: ['mindmap', 'mind', '思维导图'] },
  { id: 'image', title: '图片管理', icon: FileImage, href: '/image', keywords: ['image', 'photo', '图片'] },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = React.useState('')

  const runCommand = React.useCallback((command: CommandItem) => {
    onOpenChange(false)
    if (command.href) {
      router.push(command.href)
    }
    else if (command.action) {
      command.action()
    }
  }, [onOpenChange, router])

  // 键盘快捷键
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const filteredItems = React.useMemo(() => {
    const themeItems: CommandItem[] = [
      {
        id: 'theme-light',
        title: '切换到亮色模式',
        icon: Sun,
        action: () => setTheme('light'),
        keywords: ['theme', 'light', '主题', '亮色'],
      },
      {
        id: 'theme-dark',
        title: '切换到暗色模式',
        icon: Moon,
        action: () => setTheme('dark'),
        keywords: ['theme', 'dark', '主题', '暗色'],
      },
    ]

    const allItems = [
      ...navigationItems.map(item => ({ ...item, section: '导航' })),
      ...themeItems.map(item => ({ ...item, section: '设置' })),
    ]

    if (!searchQuery)
      return allItems
    const query = searchQuery.toLowerCase()
    return allItems.filter(item =>
      item.title.toLowerCase().includes(query)
      || item.keywords?.some(k => k.toLowerCase().includes(query)),
    )
  }, [searchQuery, setTheme])

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredItems.forEach((item) => {
      const section = item.section || '其他'
      if (!groups[section])
        groups[section] = []
      groups[section].push(item)
    })
    return groups
  }, [filteredItems])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="命令面板"
      className={cn(
        'fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2',
        'bg-background-elevated rounded-xl border border-border shadow-2xl',
        'overflow-hidden',
      )}
    >
      <DialogTitle className="sr-only">命令面板</DialogTitle>
      <DialogDescription className="sr-only">
        通过搜索快速导航到不同页面或执行主题修改等操作。
      </DialogDescription>

      {/* 搜索输入框 */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Command.Input
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="搜索或输入命令..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
          ESC
        </kbd>
      </div>

      {/* 命令列表 */}
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
          未找到结果
        </Command.Empty>

        {Object.entries(groupedItems).map(([section, items]) => (
          <Command.Group key={section} heading={section} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  onSelect={() => runCommand(item)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer',
                    'text-foreground',
                    'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
                    'transition-colors',
                  )}
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{item.title}</span>
                  {item.shortcut && (
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
                      {item.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              )
            })}
          </Command.Group>
        ))}
      </Command.List>

      {/* 底部提示 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑</kbd>
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↓</kbd>
            导航
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
            选择
          </span>
        </div>
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘</kbd>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">K</kbd>
          打开
        </span>
      </div>
    </Command.Dialog>
  )
}
