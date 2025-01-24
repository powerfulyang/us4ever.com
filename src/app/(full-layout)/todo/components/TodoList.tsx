'use client'

import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { AnimatePresence } from 'framer-motion'
import React from 'react'
import { TodoItem } from './TodoItem'

export default function TodoList() {
  const utils = api.useUtils()

  const { data: todos = [], isLoading } = api.todo.getAll.useQuery()

  if (isLoading) {
    return (
      <LoadingSpinner text="加载中..." />
    )
  }

  if (!todos.length) {
    return <Empty title="暂无待办事项"></Empty>
  }

  const toggleStatus = api.todo.toggleStatus.useMutation({
    onSuccess: () => {
      return utils.todo.getAll.invalidate()
    },
  })

  const togglePublic = api.todo.togglePublic.useMutation({
    onSuccess: () => {
      return utils.todo.getAll.invalidate()
    },
  })

  const togglePin = api.todo.togglePin.useMutation({
    onSuccess: () => {
      return utils.todo.getAll.invalidate()
    },
  })

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => {
      return utils.todo.getAll.invalidate()
    },
  })

  return (
    <AnimatePresence mode="popLayout">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleStatus={() =>
            toggleStatus.mutate({
              id: todo.id,
              status: !todo.status,
            })}
          onTogglePublic={() =>
            togglePublic.mutate({
              id: todo.id,
              isPublic: !todo.isPublic,
            })}
          onTogglePin={() =>
            togglePin.mutate({
              id: todo.id,
              pinned: !todo.pinned,
            })}
          onDelete={() => deleteTodo.mutate({ id: todo.id })}
          isStatusPending={toggleStatus.isPending}
          isPublicPending={togglePublic.isPending}
          isPinPending={togglePin.isPending}
          isDeletePending={deleteTodo.isPending}
        />
      ))}
    </AnimatePresence>
  )
}
