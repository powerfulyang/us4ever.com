import Link from 'next/link'
import { api } from '@/trpc/server'
import { cn } from '@/utils/cn'

export async function ImageCategory() {
  const categories = await api.asset.getImageCategories()
  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4 text-white">图片分类</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map(category => (
          <Link
            key={category}
            href={`/image/category/${category}`}
            className={cn(
              'flex items-center justify-center px-4 py-3 rounded-lg text-white',
              'bg-white/10 hover:bg-purple-500/20 border border-white/20 hover:border-purple-500/50',
              'text-center font-medium transition-all duration-300',
              'shadow-sm hover:shadow-md',
            )}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  )
}
