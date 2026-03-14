'use client'

import { LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

interface ViewToggleProps {
  category?: string
}

export function ViewToggle({ category }: ViewToggleProps) {
  const pathname = usePathname()
  const isFeed = pathname === '/keep/feed'

  const basePath = '/keep'
  const feedPath = '/keep/feed'

  // 构建带分类参数的链接
  const getHref = (path: string) => {
    if (category) {
      return `${path}?category=${encodeURIComponent(category)}`
    }
    return path
  }

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
      <Link href={getHref(basePath)}>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md text-xs font-medium transition-all px-2.5 py-1.5 whitespace-nowrap',
            !isFeed
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">分页</span>
        </button>
      </Link>
      <Link href={getHref(feedPath)}>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md text-xs font-medium transition-all px-2.5 py-1.5 whitespace-nowrap',
            isFeed
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">流式</span>
        </button>
      </Link>
    </div>
  )
}
