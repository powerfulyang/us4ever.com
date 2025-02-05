import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { ImageList } from './components/list'
import { ImageUpload } from './components/upload'

export const metadata: Metadata = {
  title: '图片管理',
  description: '管理各个地方上传的图片',
  alternates: {
    canonical: `/image`,
  },
}

export default async function ImagePage() {
  await api.asset.list_image.prefetch()
  return (
    <HydrateClient>
      <Container
        title="图片管理"
        description="图片统一管理"
      >
        <ImageUpload />
        <ImageList />
      </Container>
    </HydrateClient>
  )
}
