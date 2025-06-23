import { CategoryList } from '@/components/ui/category-list'
import { api as serverApi } from '@/trpc/server'

interface MomentCategoryProps {
  currentCategory?: string
}

// 服务端版本，用于预渲染
export async function MomentCategoryServer({ currentCategory }: MomentCategoryProps) {
  const categories = await serverApi.moment.getCategories()

  return (
    <CategoryList
      title="动态分类"
      categories={categories}
      basePath="/moment"
      currentCategory={currentCategory}
    />
  )
}
