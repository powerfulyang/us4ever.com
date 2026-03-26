import { CategoryList } from '@/components/ui/category-list'
import { api as serverApi } from '@/trpc/server'

interface KeepCategoryProps {
  currentCategory?: string
  basePath?: string
  visibility?: string
}

// 服务端版本，用于预渲染
export async function KeepCategoryServer({ currentCategory, basePath = '/keep', visibility }: KeepCategoryProps) {
  const categories = await serverApi.keep.getCategories({ visibility: visibility as any })

  return (
    <CategoryList
      title="笔记分类"
      categories={categories}
      basePath={basePath}
      currentCategory={currentCategory}
      linkType="query"
      extraQueryParams={{ visibility }}
    />
  )
}
