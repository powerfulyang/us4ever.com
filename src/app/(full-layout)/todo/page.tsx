import React from 'react'
import TodoList from 'src/app/(full-layout)/todo/components/TodoList'
import { TodoForm } from '@/app/(full-layout)/todo/components/TodoForm'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata = {
  title: '待办事项',
  description: '管理您的待办事项清单',
  alternates: {
    canonical: `/todo`,
  },
}

export default async function Todo() {
  await api.todo.infinite_list.prefetch({})
  return (
    <HydrateClient>
      <Container title="待办事项" description="记录你的待办事项">
        <div className="flex gap-4 flex-col max-w-xl m-auto">
          <TodoForm />
          <TodoList />
        </div>
      </Container>
    </HydrateClient>
  )
}
