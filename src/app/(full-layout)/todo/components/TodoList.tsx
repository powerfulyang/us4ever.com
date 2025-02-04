'use client'

import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { AnimatePresence } from 'framer-motion'
import { TodoItem } from './TodoItem'

export default function TodoList() {
  const { data: todos = [], isPending } = api.todo.getAll.useQuery()

  if (isPending) {
    return (
      <LoadingSpinner text="加载中..." />
    )
  }

  if (!todos.length) {
    return <Empty title="暂无待办事项"></Empty>
  }

  return (
    <AnimatePresence mode="popLayout">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
        />
      ))}
    </AnimatePresence>
  )
}
