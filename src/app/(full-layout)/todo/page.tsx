import type { Metadata } from 'next'
import TodoList from 'src/app/(full-layout)/todo/components/TodoList'
import { TodoForm } from '@/app/(full-layout)/todo/components/TodoForm'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '待办事项',
  description: '管理您的待办事项清单',
  alternates: {
    canonical: `/todo`,
  },
}

export default async function Todo() {
  await api.todo.fetchByCursor.prefetch({})
  return (
    <HydrateClient>
      <Container
        title="待办事项"
        description="管理你的待办任务"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <TodoForm />
          <TodoList />
        </div>
      </Container>
    </HydrateClient>
  )
}
