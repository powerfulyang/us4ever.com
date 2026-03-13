import { CategoryList } from '@/components/ui/category-list'
import { api as serverApi } from '@/trpc/server'

interface ImageCategoryProps {
  currentCategory?: string
}

// 服务端版本，用于预渲染
export async function ImageCategoryServer({ currentCategory }: ImageCategoryProps) {
  const categories = await serverApi.asset.getImageCategories()

  return (
    <CategoryList
      title="图片分类"
      categories={categories}
      basePath="/image"
      currentCategory={currentCategory}
      linkType="query"
    />
  )
}
