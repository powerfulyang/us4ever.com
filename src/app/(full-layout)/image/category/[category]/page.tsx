import type { Metadata } from 'next'
import { ImageCategoryServer } from '@/app/(full-layout)/image/components/category'
import { ImageList } from '@/app/(full-layout)/image/components/list'
import { ImageUpload } from '@/app/(full-layout)/image/components/upload'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

interface ImagePageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: ImagePageProps): Promise<Metadata> {
  const category = decodeURIComponent((await params).category)

  return {
    title: '图片管理',
    description: `管理各个地方上传的图片 - ${category}`,
    alternates: {
      canonical: `/image/${category}`,
    },
  }
}

export default async function ImagePage({ params }: ImagePageProps) {
  const category = decodeURIComponent((await params).category)

  await api.asset.fetchImagesByCursor.prefetch({
    category,
  })

  return (
    <HydrateClient>
      <Container
        title="图片管理"
        description="图片统一管理"
      >
        <ImageUpload category={category} />
        <ImageCategoryServer currentCategory={category} />
        <ImageList category={category} />
      </Container>
    </HydrateClient>
  )
}
