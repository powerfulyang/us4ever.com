import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserInfoProps {
  user?: {
    avatar?: string | null
    nickname?: string | null
  } | null
  createdAt: Date | string
  rightArea?: ReactNode
  className?: string
  avatarSize?: 'sm' | 'md' | 'lg'
}

export function UserInfo({
  user,
  createdAt,
  rightArea,
  className,
  avatarSize = 'md',
}: UserInfoProps) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className={cn(sizeMap[avatarSize], 'ring-2 ring-background shrink-0 shadow-sm')}>
        <AvatarImage src={user?.avatar ?? ''} alt={user?.nickname ?? 'Anonymous'} className="object-cover" />
        <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
          {user?.nickname?.charAt(0).toUpperCase() ?? '匿'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {user?.nickname ?? '匿名'}
          </span>
        </div>
        <time className="text-[11px] text-muted-foreground/60 font-medium tabular-nums">
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
        </time>
      </div>

      {rightArea && (
        <div className="flex-shrink-0 flex items-center">
          {rightArea}
        </div>
      )}
    </div>
  )
}
