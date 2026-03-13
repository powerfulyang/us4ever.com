import dayjs from 'dayjs'
import { Globe, Lock } from 'lucide-react'
import { MdRender } from '@/components/md-render'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ItemActions } from '@/components/ui/item-actions'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ContentCardProps {
  title: string
  status?: {
    label: string
    type: 'success' | 'warning' | 'error' | 'default'
  }
  createdAt: Date | string
  content: string
  views?: number
  likes?: number
  ownerId?: string
  onDelete?: (e: React.MouseEvent) => void
  onClick?: () => void
  className?: string
}

const statusVariants = {
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'destructive' as const,
  default: 'secondary' as const,
}

const statusIcons = {
  success: Globe,
  warning: Lock,
  error: Lock,
  default: Lock,
}

export function ContentCard({
  title,
  status,
  createdAt,
  content,
  views,
  likes,
  ownerId,
  onDelete,
  onClick,
  className,
}: ContentCardProps) {
  const showFooter = views !== undefined || likes !== undefined || ownerId

  return (
    <Card hoverable onClick={onClick} className={cn('flex flex-col h-full p-4 cursor-pointer', className)}>
      {/* 头部 */}
      <div className="space-y-1.5 mb-3">
        <h3 className="text-base font-semibold text-foreground line-clamp-1">
          {title || '标题生成中...'}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {status && (
            <Badge variant={statusVariants[status.type]} className="text-[10px] h-5 px-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider">
              {(() => {
                const Icon = statusIcons[status.type]
                return Icon && <Icon className="w-3 h-3" />
              })()}
              {status.label}
            </Badge>
          )}
          <time className="text-xs text-muted-foreground/60 font-medium">
            {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
          </time>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1">
        <MdRender className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {content || '总结生成中...'}
        </MdRender>
      </div>

      {/* 底部 */}
      {showFooter && (
        <div className="mt-auto pt-3">
          <Separator className="mb-3 opacity-50" />
          <ItemActions
            views={views}
            likes={likes}
            ownerId={ownerId}
            onDelete={onDelete}
          />
        </div>
      )}
    </Card>
  )
}
