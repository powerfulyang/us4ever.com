import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative mb-8 rounded-[24px] p-6 lg:p-8 overflow-hidden backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
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
