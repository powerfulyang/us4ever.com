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
            todo.pinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400',
          )}
        >
          <span className="hidden sm:inline">置顶</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
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
