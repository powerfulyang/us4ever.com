import type { Metadata } from 'next'
import { TodoForm } from '@/app/(full-layout)/todo/components/TodoForm'
import TodoList from '@/app/(full-layout)/todo/components/TodoList'
import { ViewToggle } from '@/app/(full-layout)/todo/components/view-toggle'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '待办事项',
  description: '管理您的待办事项清单',
  alternates: {
    canonical: `/todo/feed`,
  },
}

export default async function TodoFeedPage() {
  await api.todo.fetchByCursor.prefetch({})

  return (
    <HydrateClient>
      <Container
        title="待办事项"
        description="管理你的待办任务"
        actions={<ViewToggle />}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <TodoForm />
          <TodoList />
        </div>
      </Container>
    </HydrateClient>
  )
}
