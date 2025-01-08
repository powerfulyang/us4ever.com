'use client'

import type { Todo } from '@prisma/client'
import { cn } from '@/utils/cn'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export interface TodoItemProps {
  todo: Todo
  onToggleStatus: () => void
  onTogglePublic: () => void
  onTogglePin: () => void
  onDelete: () => void
  isStatusPending: boolean
  isPublicPending: boolean
  isPinPending: boolean
  isDeletePending: boolean
}

export function TodoItem({
  todo,
  onToggleStatus,
  onTogglePublic,
  onTogglePin,
  onDelete,
  isStatusPending,
  isPublicPending,
  isPinPending,
  isDeletePending,
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        setHasOverflow(contentRef.current.scrollHeight > contentRef.current.clientHeight)
      }
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [todo.title])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:border-purple-500/50 transition-colors relative"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <motion.button
          layout="preserve-aspect"
          type="button"
          onClick={onToggleStatus}
          disabled={isStatusPending}
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
          <motion.div
            ref={contentRef}
            layout="position"
            className={cn(
              'relative text-white break-words',
              !isExpanded && 'line-clamp-3',
              todo.status && 'line-through text-gray-400',
            )}
          >
            {todo.title}
          </motion.div>
          <motion.div
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            <span className="truncate">
              创建于
              <span className="hidden sm:inline">
                {dayjs(todo.createdAt).format('YYYY年MM月DD日 HH:mm:ss')}
              </span>
              <span className="sm:hidden">
                {dayjs(todo.createdAt).format('MM-DD HH:mm')}
              </span>
            </span>
            {hasOverflow && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-400 hover:text-purple-300 transition-colors shrink-0"
              >
                {isExpanded ? '收起' : '展开'}
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="flex items-center gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10"
        layout="preserve-aspect"
      >
        <button
          type="button"
          onClick={onTogglePin}
          disabled={isPinPending}
          className={cn(
            'p-1.5 rounded transition-colors',
            todo.pinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-300',
          )}
        >
          <span className="hidden sm:inline">置顶</span>
          <svg className="w-5 h-5 sm:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.102 2.664c.628-.416 1.692-.713 2.495.09l4.647 4.648c.806.804.508 1.868.091 2.495a2.95 2.95 0 0 1-.863.85c-.334.213-.756.374-1.211.35a9 9 0 0 1-.658-.071l-.068-.01a9 9 0 0 0-.707-.073c-.504-.025-.698.06-.76.12l-2.49 2.491c-.08.08-.18.258-.256.6c-.073.33-.105.736-.113 1.186c-.007.432.008.874.024 1.3l.001.047c.015.423.03.855.009 1.194c-.065 1.031-.868 1.79-1.658 2.141c-.79.35-1.917.437-2.7-.347l-2.25-2.25L3.53 21.53a.75.75 0 1 1-1.06-1.06l4.104-4.105l-2.25-2.25c-.783-.784-.697-1.91-.346-2.7c.35-.79 1.11-1.593 2.14-1.658c.34-.021.772-.006 1.195.009l.047.001c.426.015.868.031 1.3.024c.45-.008.856-.04 1.186-.113c.342-.076.52-.177.6-.257l2.49-2.49c.061-.061.146-.256.12-.76a9 9 0 0 0-.073-.707l-.009-.068a9 9 0 0 1-.071-.658c-.025-.455.136-.877.348-1.211c.216-.34.515-.64.851-.863" /></svg>
        </button>

        <button
          type="button"
          onClick={onTogglePublic}
          disabled={isPublicPending}
          className={cn(
            'px-2 py-1 rounded text-sm transition-colors',
            todo.isPublic ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30',
          )}
        >
          {todo.isPublic ? '公开' : '私有'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeletePending}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
      </motion.div>
    </motion.div>
  )
}
