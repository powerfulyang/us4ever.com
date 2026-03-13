import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { ImageCategoryServer } from '../components/category'
import { ImageList } from '../components/list'
import { ImageUpload } from '../components/upload'
import { ViewToggle } from '../components/view-toggle'

export const metadata: Metadata = {
  title: '图片管理',
  description: '管理各个地方上传的图片',
  alternates: {
    canonical: `/image/feed`,
  },
}

export default async function ImageFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  await api.asset.fetchImagesByCursor.prefetch({ category })

  return (
    <HydrateClient>
      <Container
        title="图片管理"
        description="图片统一管理"
        actions={<ViewToggle category={category} />}
      >
        <div className="max-w-5xl mx-auto">
          <ImageUpload />
          <ImageCategoryServer currentCategory={category} />
          <ImageList category={category} />
        </div>
      </Container>
    </HydrateClient>
  )
}
