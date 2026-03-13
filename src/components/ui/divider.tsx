import { cn } from '@/lib/utils'

interface DividerProps {
  className?: string
  dashed?: boolean
}

export function Divider({ className, dashed = true }: DividerProps) {
  return (
    <div
      className={cn(
        'border-t border-border',
        dashed ? 'border-dashed' : 'border-solid',
        className,
      )}
      role="separator"
    />
  )
}
