'use client'

import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { api } from '@/trpc/react'
import { AnimatePresence } from 'framer-motion'
import React, { useMemo, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { TodoItem } from './TodoItem'

export default function TodoPage() {
  const [title, setTitle] = useState('')
  const utils = api.useUtils()

  const { data: todos = [], isLoading } = api.todo.getAll.useQuery()

  const createTodo = api.todo.create.useMutation({
    onSuccess: () => {
      setTitle('')
      return utils.todo.getAll.invalidate()
    },
  })

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

  const isDisableSubmit = useMemo(() => {
    return !title.trim() || createTodo.isPending
  }, [createTodo.isPending, title])

  function create() {
    if (isDisableSubmit)
      return
    createTodo.mutate({ title: title.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      create()
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            待办事项
          </h1>
          <p className="text-sm text-gray-400">记录你的待办事项</p>
        </div>
      </div>

      <div className="space-y-4">
        <AuthenticatedOnly>
          <div className="flex gap-4 items-center">
            <TextareaAutosize
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加新的待办事项..."
              minRows={1}
              rows={1}
              className="flex-1 rounded-lg bg-white/10 backdrop-blur-lg px-4 py-2 text-white placeholder-gray-400 border border-white/20 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
            />
            <button
              type="button"
              onClick={create}
              disabled={isDisableSubmit}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative overflow-hidden whitespace-nowrap"
            >
              {createTodo.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-500">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
              添加
            </button>
          </div>
        </AuthenticatedOnly>
        {isLoading
          ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )
          : todos.length === 0
            ? (
                <div className="text-center py-32 text-gray-400">
                  还没有待办事项
                </div>
              )
            : (
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
              )}
      </div>
    </>
  )
}
