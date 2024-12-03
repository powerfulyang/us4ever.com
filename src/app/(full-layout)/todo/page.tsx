import { api, HydrateClient } from '@/trpc/server'
import TodoPage from './components/TodoPage'

export default async function Todo() {
  await api.todo.getAll.prefetch()
  return (
    <HydrateClient>
      <TodoPage />
    </HydrateClient>
  )
}
