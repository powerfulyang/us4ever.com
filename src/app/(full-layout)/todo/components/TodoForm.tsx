'use client'

import { Plus } from 'lucide-react'
import * as React from 'react'
import { useMemo, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'

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
      return utils.todo.fetchByCursor.invalidate()
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
    <AuthenticatedOnly disableChildren>
      <div className="flex gap-3 items-center">
        <TextareaAutosize
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加新的待办事项..."
          minRows={1}
          rows={1}
          className="flex-1 rounded-md bg-secondary/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary/50 focus:outline-none transition-colors resize-none"
        />
        <Button
          onClick={create}
          disabled={isDisableSubmit}
          className="gap-1 shrink-0 h-[45px]"
        >
          {createTodo.isPending
            ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              )
            : (
                <Plus className="h-4 w-4" />
              )}
          添加
        </Button>
      </div>
    </AuthenticatedOnly>
  )
}
