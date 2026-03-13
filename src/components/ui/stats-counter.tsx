import { cn } from '@/lib/utils'

interface StatsCounterProps {
  views?: number
  likes?: number
  className?: string
}

export function StatsCounter({ views, likes, className }: StatsCounterProps) {
  return (
    <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
      {typeof views === 'number' && (
        <span>
          浏览:
          <span className="pl-1 font-medium text-foreground">{views}</span>
        </span>
      )}
      {typeof likes === 'number' && (
        <span>
          点赞:
          <span className="pl-1 font-medium text-foreground">{likes}</span>
        </span>
      )}
    </div>
  )
}
