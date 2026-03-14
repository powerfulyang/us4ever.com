import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MobileRedirect } from '@/components/mobile-redirect'
import { MomentCategoryServer } from './components/category'
import { MomentCreate } from './components/create'
import { MomentPaginationClient } from './components/pagination-client'
import { ViewToggle } from './components/view-toggle'

export const metadata: Metadata = {
  title: '动态',
  description: '分享生活点滴',
  alternates: {
    canonical: `/moment`,
  },
}

export default async function MomentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, page?: string }>
}) {
  const { category, page: pageParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1

  await api.moment.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: 6,
    category,
  })

  return (
    <HydrateClient>
      <MobileRedirect />
      <Container
        title="动态"
        description="分享生活点滴"
        actions={<ViewToggle category={category} />}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <MomentCreate />
          <MomentCategoryServer currentCategory={category} />
          <MomentPaginationClient category={category} initialPage={Math.max(1, page)} />
        </div>
      </Container>
    </HydrateClient>
  )
}
