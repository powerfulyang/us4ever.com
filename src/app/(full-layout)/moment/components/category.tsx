import { CategoryList } from '@/components/ui/category-list'
import { api as serverApi } from '@/trpc/server'

interface MomentCategoryProps {
  currentCategory?: string
  basePath?: string
  visibility?: string
}

// 服务端版本，用于预渲染
export async function MomentCategoryServer({ currentCategory, basePath = '/moment', visibility }: MomentCategoryProps) {
  const categories = await serverApi.moment.getCategories({ visibility: visibility as any })

  return (
    <CategoryList
      title="动态分类"
      categories={categories}
      basePath={basePath}
      currentCategory={currentCategory}
      linkType="query"
      extraQueryParams={{ visibility }}
    />
  )
}
