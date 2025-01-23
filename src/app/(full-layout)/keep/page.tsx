import type { Metadata } from 'next'
import { KeepList } from '@/components/keep/list'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: 'Keep',
  description: 'A place to record inspiration and thinking',
}

export default async function KeepPage() {
  await api.keep.list.prefetch()
  return (
    <HydrateClient>
      <Container
        title="我的笔记本"
        description="记录灵感与思考的地方"
        actionHref="/keep/save"
        actionText="创建笔记"
      >
        <KeepList />
      </Container>
    </HydrateClient>
  )
}
