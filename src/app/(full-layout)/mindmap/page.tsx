import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MindMapList } from 'src/app/(full-layout)/mindmap/components/list'
import { MindMapImport } from './components/create'

export const metadata: Metadata = {
  title: '思维导图',
  description: '记录和分享你的思维导图',
  alternates: {
    canonical: `${BASE_URL}/mindmap`,
  },
}

export default async function MindMapPage() {
  await api.mindmap.list.prefetch()
  return (
    <HydrateClient>
      <Container
        title="思维导图"
        description="记录和分享你的思维导图"
        rightContent={(
          <MindMapImport />
        )}
      >
        <MindMapList />
      </Container>
    </HydrateClient>
  )
}
