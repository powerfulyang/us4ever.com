import type { ReactNode } from 'react'

interface ContainerProps {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}

export function Container({
  title,
  description,
  children,
  actions,
}: ContainerProps) {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {/* 页面内容 */}
      {children}
    </div>
  )
}

interface SectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
