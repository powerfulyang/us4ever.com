import type { Metadata } from 'next'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { ImageList } from '@/components/image/list'
import { ImageUpload } from '@/components/image/upload'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: 'Image',
  description: 'Image management',
}

export default async function ImagePage() {
  await api.asset.list_image.prefetch()
  return (
    <HydrateClient>
      <Container
        title="图片管理"
        description="图片统一管理"
      >
        <AuthenticatedOnly>
          <ImageUpload />
        </AuthenticatedOnly>
        <ImageList />
      </Container>
    </HydrateClient>
  )
}
