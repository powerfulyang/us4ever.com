import type { Metadata } from 'next'
import { ImageList } from '@/app/(full-layout)/image/components/list'
import { ImageUpload } from '@/app/(full-layout)/image/components/upload'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '图片管理',
  description: '管理各个地方上传的图片',
  alternates: {
    canonical: `/image`,
  },
}

interface ImagePageProps {
  params: Promise<{ category?: string }>
}

export default async function ImagePage({ params }: ImagePageProps) {
  const { category } = await params
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
        <ImageList category={category} />
      </Container>
    </HydrateClient>
  )
}
