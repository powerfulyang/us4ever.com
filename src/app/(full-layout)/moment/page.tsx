import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MomentCategoryServer } from './components/category'
import { MomentCreate } from './components/create'
import { MomentList } from './components/list'

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
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  await api.moment.fetchByCursor.prefetch({ category })
  return (
    <HydrateClient>
      <Container
        title="动态"
        description="分享生活点滴"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <MomentCreate />
          <MomentCategoryServer currentCategory={category} />
          <MomentList category={category} />
        </div>
      </Container>
    </HydrateClient>
  )
}
