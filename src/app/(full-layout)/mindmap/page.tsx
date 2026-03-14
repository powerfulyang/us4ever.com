import type { Metadata } from 'next'
import { MindMapPaginationClient } from '@/app/(full-layout)/mindmap/components/pagination-client'
import { ViewToggle } from '@/app/(full-layout)/mindmap/components/view-toggle'
import { Container } from '@/components/layout/Container'
import { MobileRedirect } from '@/components/mobile-redirect'
import { api, HydrateClient } from '@/trpc/server'
import { MindMapImport } from './components/create'

export const metadata: Metadata = {
  title: '思维导图',
  description: '记录和分享你的思维导图',
  alternates: {
    canonical: `/mindmap`,
  },
}

export default async function MindMapPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1

  await api.mindMap.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: 6,
  })

  return (
    <HydrateClient>
      <MobileRedirect />
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
        <MindMapPaginationClient initialPage={Math.max(1, page)} />
      </Container>
    </HydrateClient>
  )
}
