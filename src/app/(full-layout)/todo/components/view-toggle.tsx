'use client'

import { LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export function ViewToggle() {
  const pathname = usePathname()
  const isFeed = pathname === '/todo/feed'

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Link href="/todo">
        <Button
          variant={!isFeed ? 'secondary' : 'ghost'}
          size="sm"
          className={cn(
            'gap-1.5 h-7',
            !isFeed && 'bg-background shadow-sm',
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">分页</span>
        </Button>
      </Link>
      <Link href="/todo/feed">
        <Button
          variant={isFeed ? 'secondary' : 'ghost'}
          size="sm"
          className={cn(
            'gap-1.5 h-7',
            isFeed && 'bg-background shadow-sm',
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">流式</span>
        </Button>
      </Link>
    </div>
  )
}
