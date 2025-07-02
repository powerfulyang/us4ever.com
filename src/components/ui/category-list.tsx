import Link from 'next/link'
import { cn } from '@/utils/cn'

interface CategoryListProps {
  title?: string
  categories: string[]
  basePath: string
  currentCategory?: string
}

export function CategoryList({ title = '分类', categories, basePath, currentCategory }: CategoryListProps) {
  // 从路径或参数中获取当前分类
  const activeCategory = currentCategory

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href={basePath}
          className={cn(
            'flex items-center justify-center px-3 py-1.5 rounded-lg text-white text-xs',
            'border transition-all duration-300 shadow-sm hover:shadow-md',
            !activeCategory
              ? 'bg-purple-500/40 border-purple-500/70 hover:bg-purple-500/50'
              : 'bg-white/10 hover:bg-purple-500/20 border-white/20 hover:border-purple-500/50',
          )}
        >
          全部
        </Link>
        {categories.map(category => (
          <Link
            key={category}
            href={`${basePath}/category/${category}`}
            className={cn(
              'flex items-center justify-center px-3 py-1.5 rounded-lg text-white text-xs',
              'border transition-all duration-300 shadow-sm hover:shadow-md',
              activeCategory === category
                ? 'bg-purple-500/40 border-purple-500/70 hover:bg-purple-500/50'
                : 'bg-white/10 hover:bg-purple-500/20 border-white/20 hover:border-purple-500/50',
            )}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  )
}
