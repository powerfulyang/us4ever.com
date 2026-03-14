import type { Metadata } from 'next'
import { TodoPaginationClient } from '@/app/(full-layout)/todo/components/pagination-client'
import { TodoForm } from '@/app/(full-layout)/todo/components/TodoForm'
import { ViewToggle } from '@/app/(full-layout)/todo/components/view-toggle'
import { Container } from '@/components/layout/Container'
import { MobileRedirect } from '@/components/mobile-redirect'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '待办事项',
  description: '管理您的待办事项清单',
  alternates: {
    canonical: `/todo`,
  },
}

export default async function TodoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1

  await api.todo.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: 6,
  })

  return (
    <HydrateClient>
      <MobileRedirect />
      <Container
        title="待办事项"
        description="管理你的待办任务"
        actions={<ViewToggle />}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <TodoForm />
          <TodoPaginationClient initialPage={Math.max(1, page)} />
        </div>
      </Container>
    </HydrateClient>
  )
}
