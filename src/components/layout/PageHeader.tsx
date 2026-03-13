import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

interface PageSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function PageSection({ title, children, className }: PageSectionProps) {
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
