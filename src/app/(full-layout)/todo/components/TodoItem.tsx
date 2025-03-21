'use client'

import type { Todo } from '@prisma/client'
import { OwnerOnly } from '@/components/auth/owner-only'
import { MdRender } from '@/components/md-render'
import { Modal } from '@/components/ui/modal'
import { useUserStore } from '@/store/user'
import { api } from '@/trpc/react'
import { cn } from '@/utils/cn'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import React, { useMemo, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

export interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const utils = api.useUtils()

  const { currentUser } = useUserStore()

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
      setIsDeleteModalOpen(false)
      return utils.todo.getAll.invalidate()
    },
  })

  const updateTodo = api.todo.update.useMutation({
    onSuccess: () => {
      setIsEditModalOpen(false)
      return utils.todo.getAll.invalidate()
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
        className="group flex flex-col gap-4 bg-white/10 backdrop-blur-lg rounded-lg px-4 pt-4 p-2 border border-white/20 hover:border-purple-500/50 transition-colors relative"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <motion.button
            layout="preserve-aspect"
            type="button"
            onClick={() => toggleStatus.mutate({
              id: todo.id,
              status: !todo.status,
            })}
            disabled={toggleStatus.isPending || !isOwn}
            className={cn(
              'relative shrink-0 w-5 h-5 rounded border transition-colors',
              todo.status ? 'bg-purple-500 border-purple-500' : 'border-gray-400 group-hover:border-purple-500',
            )}
          >
            {todo.status && (
              <svg
                className="absolute inset-0 w-full h-full text-white p-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </motion.button>

          <div className="flex-1 min-w-0 space-y-1">
            <MdRender className={cn(
              todo.status ? '!line-through !text-gray-400' : '',
            )}
            >
              {todo.title}
            </MdRender>
            <motion.div
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <span className="truncate text-xs">
                创建于
                <span className="pl-1">
                  {dayjs(todo.createdAt).format('YYYY年MM月DD日 HH:mm:ss')}
                </span>
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex items-center gap-2 border-t pt-2 border-dashed border-white/10"
          layout="preserve-aspect"
        >
          <button
            type="button"
            onClick={() => togglePin.mutate({
              id: todo.id,
              pinned: !todo.pinned,
            })}
            disabled={togglePin.isPending || !isOwn}
            className={cn(
              'p-1.5 rounded transition-colors',
              todo.pinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-300',
            )}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.102 2.664c.628-.416 1.692-.713 2.495.09l4.647 4.648c.806.804.508 1.868.091 2.495a2.95 2.95 0 0 1-.863.85c-.334.213-.756.374-1.211.35a9 9 0 0 1-.658-.071l-.068-.01a9 9 0 0 0-.707-.073c-.504-.025-.698.06-.76.12l-2.49 2.491c-.08.08-.18.258-.256.6c-.073.33-.105.736-.113 1.186c-.007.432.008.874.024 1.3l.001.047c.015.423.03.855.009 1.194c-.065 1.031-.868 1.79-1.658 2.141c-.79.35-1.917.437-2.7-.347l-2.25-2.25L3.53 21.53a.75.75 0 1 1-1.06-1.06l4.104-4.105l-2.25-2.25c-.783-.784-.697-1.91-.346-2.7c.35-.79 1.11-1.593 2.14-1.658c.34-.021.772-.006 1.195.009l.047.001c.426.015.868.031 1.3.024c.45-.008.856-.04 1.186-.113c.342-.076.52-.177.6-.257l2.49-2.49c.061-.061.146-.256.12-.76a9 9 0 0 0-.073-.707l-.009-.068a9 9 0 0 1-.071-.658c-.025-.455.136-.877.348-1.211c.216-.34.515-.64.851-.863" /></svg>
          </button>

          <button
            type="button"
            onClick={() => togglePublic.mutate({
              id: todo.id,
              isPublic: !todo.isPublic,
            })}
            disabled={togglePublic.isPending || !isOwn}
            className={cn(
              'px-2 py-1 rounded text-xs transition-colors',
              todo.isPublic ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30',
            )}
          >
            {todo.isPublic ? '公开' : '私密'}
          </button>

          <OwnerOnly ownerId={todo.ownerId}>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleteTodo.isPending}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </OwnerOnly>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={isDeleteModalOpen}
        onCloseAction={() => setIsDeleteModalOpen(false)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-gray-300">确定要删除这个待办事项吗？此操作不可撤销。</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => deleteTodo.mutate({ id: todo.id })}
              disabled={deleteTodo.isPending}
              className="px-4 py-2 text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteTodo.isPending ? '删除中...' : '确认删除'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onCloseAction={() => {
          setIsEditModalOpen(false)
          setEditTitle(todo.title)
        }}
        title="编辑待办事项"
      >
        <div className="space-y-4">
          <TextareaAutosize
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            minRows={10}
            rows={10}
            className="w-full h-32 px-3 py-2 text-white bg-white/5 rounded-lg border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors resize-none"
            placeholder="请输入待办事项内容"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditTitle(todo.title)
              }}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleEdit}
              disabled={updateTodo.isPending || !editTitle.trim() || editTitle === todo.title}
              className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTodo.isPending ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
