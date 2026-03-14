import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MobileRedirect } from '@/components/mobile-redirect'
import { ImageCategoryServer } from './components/category'
import { ImagePaginationClient } from './components/pagination-client'
import { ImageUpload } from './components/upload'
import { ViewToggle } from './components/view-toggle'

export const metadata: Metadata = {
  title: '图片管理',
  description: '管理各个地方上传的图片',
  alternates: {
    canonical: `/image`,
  },
}

export default async function ImagePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, page?: string }>
}) {
  const { category, page: pageParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1

  await api.asset.fetchImagesByPage.prefetch({
    page: Math.max(1, page),
    pageSize: 6,
    category,
  })

  return (
    <HydrateClient>
      <MobileRedirect />
      <Container
        title="图片管理"
        description="图片统一管理"
        actions={<ViewToggle category={category} />}
      >
        <div className="max-w-5xl mx-auto">
          <ImageUpload />
          <ImageCategoryServer currentCategory={category} />
          <ImagePaginationClient category={category} initialPage={Math.max(1, page)} />
        </div>
      </Container>
    </HydrateClient>
  )
}
