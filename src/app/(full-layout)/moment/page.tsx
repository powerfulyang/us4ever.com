import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MomentCreate } from './components/create'
import { MomentList } from './components/list'

export const metadata: Metadata = {
  title: '动态',
  description: '分享生活点滴',
  alternates: {
    canonical: `/moment`,
  },
}

export default async function MomentPage() {
  await api.moment.infiniteList.prefetch({})
  return (
    <HydrateClient>
      <Container
        title="动态"
        description="分享生活点滴"
      >
        <div className="space-y-6 max-w-[500px] m-auto">
          <MomentCreate />
          <MomentList />
        </div>
      </Container>
    </HydrateClient>
  )
}
