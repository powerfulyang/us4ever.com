import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryListProps {
  title?: string
  categories: string[]
  basePath: string
  currentCategory?: string
  linkType?: 'path' | 'query'
}

export function CategoryList({
  title = '分类',
  categories,
  basePath,
  currentCategory,
  linkType = 'path',
}: CategoryListProps) {
  const activeCategory = currentCategory

  return (
    <div className="my-6">
      {title && (
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {title}
        </h2>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Link
          href={basePath}
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
            href={linkType === 'query' ? `${basePath}?category=${category}` : `${basePath}/category/${category}`}
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
