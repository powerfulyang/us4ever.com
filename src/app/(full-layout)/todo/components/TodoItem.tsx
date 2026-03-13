'use client'

import type { Todo } from '@/server/api/routers/todo'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { Edit, Pin, Sparkles, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useMemo, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { OwnerOnly } from '@/components/auth/owner-only'
import { MdRender } from '@/components/md-render'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { useUserStore } from '@/store/user'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'

export interface TodoItemProps {
  todo: Todo
  onUpdate?: () => void
}

export function TodoItem({ todo, onUpdate }: TodoItemProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const utils = api.useUtils()

  const { currentUser } = useUserStore()

  const toggleStatus = api.todo.toggleStatus.useMutation({
    onSuccess: () => {
      void utils.todo.fetchByCursor.invalidate()
    },
  })

  const togglePin = api.todo.togglePin.useMutation({
    onSuccess: () => {
      return utils.todo.fetchByCursor.invalidate()
    },
  })

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      void utils.todo.fetchByCursor.invalidate()
      onUpdate?.()
    },
  })

  const updateTodo = api.todo.update.useMutation({
    onSuccess: () => {
      setIsEditModalOpen(false)
      return utils.todo.fetchByCursor.invalidate()
    },
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleEdit()
    }
  }

  function handleEdit() {
    if (!editTitle.trim())
      return
    updateTodo.mutate({
      id: todo.id,
      title: editTitle.trim(),
      priority: todo.priority,
      isPublic: todo.isPublic,
    })
  }

  const isOwn = useMemo(() => {
    return todo.ownerId === currentUser?.id
  }, [currentUser?.id, todo.ownerId])

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          hoverable
          className={cn(
            'p-4 transition-all duration-300 relative overflow-hidden',
            todo.status && 'bg-emerald-50/30 dark:bg-emerald-950/10',
          )}
        >
          {/* 完成状态装饰边框 */}
          {todo.status && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
          )}

          <div className="space-y-3">
            {/* 顶部：用户信息 + 开关 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {todo.owner
                  ? (
                      <>
                        <img
                          src={todo.owner.avatar}
                          alt={todo.owner.nickname}
                          className="w-7 h-7 rounded-full ring-2 ring-background"
                        />
                        <span className="text-sm font-medium text-foreground truncate">
                          {todo.owner.nickname}
                        </span>
                      </>
                    )
                  : (
                      <span className="text-sm text-muted-foreground">匿名</span>
                    )}
                <span className="text-xs text-muted-foreground">
                  ·
                  {' '}
                  {dayjs(todo.createdAt).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>

              {/* 精致的状态开关 */}
              <motion.button
                type="button"
                onClick={() => {
                  if (!todo.status) {
                    setShowCompleteConfirm(true)
                  }
                  else {
                    toggleStatus.mutate({ id: todo.id, status: false })
                  }
                }}
                disabled={toggleStatus.isPending || !isOwn}
                className={cn(
                  'relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                  todo.status
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                  !isOwn && 'opacity-50 cursor-not-allowed',
                )}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  key={todo.status ? 'done' : 'todo'}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="flex items-center justify-center"
                >
                  {todo.status
                    ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      )
                    : (
                        <span>😴</span>
                      )}
                </motion.span>
                <span>{todo.status ? '已完成' : '待办'}</span>
              </motion.button>
            </div>

            {/* 内容区 */}
            <div className={cn(
              'text-[15px] leading-relaxed',
              todo.status && 'line-through text-muted-foreground/70',
            )}
            >
              <MdRender>{todo.title}</MdRender>
            </div>

            {/* 底部：标签 + 操作 */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={todo.isPublic ? 'success' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {todo.isPublic ? '公开' : '私密'}
                </Badge>
                {todo.pinned && (
                  <Badge className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                    <Pin className="w-3 h-3" />
                    置顶
                  </Badge>
                )}
              </div>

              <OwnerOnly ownerId={todo.ownerId}>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => togglePin.mutate({ id: todo.id, pinned: !todo.pinned })}
                    disabled={togglePin.isPending}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      todo.pinned
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={deleteTodo.isPending}
                    className="p-1.5 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </OwnerOnly>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 完成确认 */}
      <Confirm
        isOpen={showCompleteConfirm}
        onCloseAction={() => setShowCompleteConfirm(false)}
        onConfirmAction={() => {
          toggleStatus.mutate({
            id: todo.id,
            status: true,
          })
          setShowCompleteConfirm(false)
        }}
        isConfirmLoading={toggleStatus.isPending}
        title="完成任务"
        content="确定要标记这个任务为已完成吗？完成后会有小惊喜哦~"
      />

      {/* 删除确认 */}
      <Confirm
        isOpen={isDeleteModalOpen}
        onCloseAction={() => setIsDeleteModalOpen(false)}
        onConfirmAction={() => deleteTodo.mutate({ id: todo.id })}
        isConfirmLoading={deleteTodo.isPending}
        title="删除待办事项"
        content="确定要删除这个待办事项吗？此操作不可撤销。"
      />

      {/* 编辑模态框 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4 p-6 space-y-4">
            <h3 className="text-lg font-semibold">编辑待办事项</h3>
            <TextareaAutosize
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={5}
              className="w-full px-3 py-2 text-foreground bg-secondary/50 rounded-md border border-transparent focus:border-primary/50 focus:outline-none transition-colors resize-none"
              placeholder="请输入待办事项内容"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditTitle(todo.title)
                }}
                className="px-4 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleEdit}
                disabled={updateTodo.isPending || !editTitle.trim() || editTitle === todo.title}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateTodo.isPending ? '保存中...' : '保存'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
