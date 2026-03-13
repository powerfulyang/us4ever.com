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
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      )}
      <div className="flex flex-wrap gap-2">
        <Link
          href={basePath}
          className={cn(
            'inline-flex items-center justify-center rounded-md border px-4 py-1.5 text-xs font-medium transition-all duration-200',
            !activeCategory
              ? 'border-primary bg-primary text-primary-foreground shadow-sm active:scale-[0.98]'
              : 'border-border bg-background-secondary text-foreground-secondary hover:border-foreground/20 hover:bg-secondary hover:text-foreground active:scale-[0.98]',
          )}
        >
          全部
        </Link>
        {categories.map(category => (
          <Link
            key={category}
            href={linkType === 'query' ? `${basePath}?category=${category}` : `${basePath}/category/${category}`}
            className={cn(
              'inline-flex items-center justify-center rounded-md border px-4 py-1.5 text-xs font-medium transition-all duration-200',
              activeCategory === category
                ? 'border-primary bg-primary text-primary-foreground shadow-sm active:scale-[0.98]'
                : 'border-border bg-background-secondary text-foreground-secondary hover:border-foreground/20 hover:bg-secondary hover:text-foreground active:scale-[0.98]',
            )}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  )
}
