'use client'

import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { api } from '@/trpc/react'
import React, { useMemo, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

export function TodoForm() {
  const [title, setTitle] = useState('')
  const utils = api.useUtils()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      create()
    }
  }

  const createTodo = api.todo.create.useMutation({
    onSuccess: () => {
      setTitle('')
      return utils.todo.infinite_list.invalidate()
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

  return (
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
      <AuthenticatedOnly disableChildren>
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
      </AuthenticatedOnly>
    </div>
  )
}
