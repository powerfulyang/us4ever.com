import type { Metadata } from 'next'
import { MindMapList } from '@/app/(full-layout)/mindmap/components/list'
import { ViewToggle } from '@/app/(full-layout)/mindmap/components/view-toggle'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MindMapImport } from '../components/create'

export const metadata: Metadata = {
  title: '思维导图',
  description: '记录和分享你的思维导图',
  alternates: {
    canonical: `/mindmap/feed`,
  },
}

export default async function MindMapFeedPage() {
  await api.mindMap.fetchByCursor.prefetch({})

  return (
    <HydrateClient>
      <Container
        title="思维导图"
        description="记录和分享你的思维导图"
        actions={(
          <div className="flex items-center gap-2">
            <ViewToggle />
            <MindMapImport />
          </div>
        )}
      >
        <MindMapList />
      </Container>
    </HydrateClient>
  )
}
