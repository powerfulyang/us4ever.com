import { api, HydrateClient } from '@/trpc/server'
import TodoPage from './components/TodoPage'

export const metadata = {
  title: '待办事项',
  description: '管理您的待办事项清单',
}

export default async function Todo() {
  await api.todo.getAll.prefetch()
  return (
    <HydrateClient>
      <TodoPage />
    </HydrateClient>
  )
}
