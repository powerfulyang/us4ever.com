import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryListProps {
  title?: string
  categories: string[]
  basePath: string
  currentCategory?: string
  linkType?: 'path' | 'query'
  extraQueryParams?: Record<string, string | null | undefined>
}

export function CategoryList({
  title = '分类',
  categories,
  basePath,
  currentCategory,
  linkType = 'path',
  extraQueryParams,
}: CategoryListProps) {
  const activeCategory = currentCategory

  const buildHref = (category?: string) => {
    const params = new URLSearchParams()
    if (extraQueryParams) {
      Object.entries(extraQueryParams).forEach(([key, value]) => {
        if (value)
          params.set(key, value)
      })
    }

    if (linkType === 'query') {
      if (category)
        params.set('category', category)
      const query = params.toString()
      return query ? `${basePath}?${query}` : basePath
    }

    const query = params.toString()
    const path = category ? `${basePath}/category/${category}` : basePath
    return query ? `${path}?${query}` : path
  }

  return (
    <div className="my-6">
      {title && (
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {title}
        </h2>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Link
          href={buildHref()}
          className={cn(
            'inline-flex items-center rounded-md text-xs font-medium transition-all px-3 py-1.5 border',
            !activeCategory
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background/50 backdrop-blur-sm border-border/30 text-muted-foreground hover:bg-background/80 hover:text-foreground hover:border-border/50',
          )}
        >
          全部
        </Link>
        {categories.map(category => (
          <Link
            key={category}
            href={buildHref(category)}
            className={cn(
              'inline-flex items-center rounded-md text-xs font-medium transition-all px-3 py-1.5 border',
              activeCategory === category
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background/50 backdrop-blur-sm border-border/30 text-muted-foreground hover:bg-background/80 hover:text-foreground hover:border-border/50',
            )}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  )
}
