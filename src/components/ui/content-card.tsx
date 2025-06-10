import dayjs from 'dayjs'
import { MdRender } from '@/components/md-render'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { ItemActions } from '@/components/ui/item-actions'
import { cn } from '@/utils/cn'

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
  onDelete?: () => void
  className?: string
}

const statusStyles = {
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/20 text-red-400',
  default: 'bg-purple-500/20 text-purple-400',
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
  className,
}: ContentCardProps) {
  const showFooter = views !== undefined || likes !== undefined || ownerId

  return (
    <Card hoverable className={cn('flex flex-col gap-2 h-full', className)}>
      <span className="text-gray-100 font-medium text-lg line-clamp-1">
        {title || '标题生成中...'}
      </span>

      <div className="flex gap-4">
        {status && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            statusStyles[status.type],
          )}
          >
            {status.label}
          </span>
        )}
        <time className="text-sm text-gray-400">
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
        </time>
      </div>

      <MdRender className="text-sm">
        {content || '总结生成中...'}
      </MdRender>

      {showFooter && (
        <div className="mt-auto">
          <Divider className="mb-3 mt-1" />
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
