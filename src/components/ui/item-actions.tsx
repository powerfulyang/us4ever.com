import { Trash2 } from 'lucide-react'
import * as React from 'react'
import { OwnerOnly } from '@/components/auth/owner-only'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatsCounter } from './stats-counter'

interface ItemActionsProps {
  views?: number
  likes?: number
  ownerId?: string
  onDelete?: (e: React.MouseEvent) => void
  className?: string
}

export function ItemActions({
  views,
  likes,
  ownerId,
  onDelete,
  className,
}: ItemActionsProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <StatsCounter views={views} likes={likes} />
      {ownerId && onDelete && (
        <OwnerOnly ownerId={ownerId}>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(e)
            }}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">删除</span>
          </Button>
        </OwnerOnly>
      )}
    </div>
  )
}
