import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { SearchForm } from '@/components/search-form'
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
  await api.moment.infinite_list.prefetch({})
  return (
    <HydrateClient>
      <Container
        title="动态"
        description="分享生活点滴"
      >
        <div className="space-y-4 max-w-[500px] m-auto">
          <SearchForm
            searchPath="/moment/search"
            placeholder="支持搜索动态内容和图片文字"
          />
          <MomentCreate />
          <MomentList />
        </div>
      </Container>
    </HydrateClient>
  )
}
