'use client'

import { motion } from 'framer-motion'
import { Globe, Lock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import { OwnerOnly } from '@/components/auth/owner-only'
import { Confirm } from '@/components/ui/confirm'
import { FormattedTime } from '@/components/ui/formatted-time'
import { api } from '@/trpc/react'

interface Keep {
  id: string
  title: string
  summary: string
  content: string
  isPublic: boolean
  tags: unknown
  category: string
  views: number
  likes: number
  ownerId: string
  createdAt: Date
  updatedAt: Date
  owner?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
}

interface KeepCardProps {
  keep: Keep
  onDelete?: () => void
}

export function KeepCard({ keep, onDelete }: KeepCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.keep.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      if (onDelete) {
        onDelete()
      }
      else {
        return utils.keep.fetchByCursor.invalidate()
      }
    },
  })

  const tags = (keep.tags as string[]) || []

  const handleDelete = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setShowConfirm(true)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="group relative flex flex-col p-5 rounded-2xl bg-white/70 dark:bg-[hsl(230_25%_9%/0.6)] backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-400 h-full cursor-pointer overflow-hidden"
      >
        <div className="relative z-10 flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-foreground line-clamp-1 flex-1">
              <Link href={`/keep/${keep.id}`} className="hover:underline before:absolute before:inset-0">
                {keep.title || '无标题'}
              </Link>
            </h3>
            <div className="flex items-center gap-1 shrink-0 relative z-10">
              {keep.isPublic
                ? (
                    <Globe className="w-4 h-4 text-green-600" />
                  )
                : (
                    <Lock className="w-4 h-4 text-amber-600" />
                  )}
              <OwnerOnly ownerId={keep.ownerId}>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </OwnerOnly>
            </div>
          </div>

          {/* 摘要 */}
          {keep.summary && (
            <p className="text-sm text-muted-foreground line-clamp-5 mb-3 flex-1">
              {keep.summary}
            </p>
          )}

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
              {tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  onClick={e => e.stopPropagation()}
                  className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              {keep.owner && (
                <>
                  <span className="font-medium">{keep.owner.nickname || '匿名'}</span>
                  <span>·</span>
                </>
              )}
              <FormattedTime date={keep.createdAt} format="YYYY/MM/DD" />
            </div>
            <div className="flex items-center gap-3">
              {keep.views > 0 && (
                <span>
                  {keep.views}
                  {' '}
                  浏览
                </span>
              )}
              {keep.likes > 0 && (
                <span>
                  {keep.likes}
                  {' '}
                  点赞
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <Confirm
        isOpen={showConfirm}
        onCloseAction={() => setShowConfirm(false)}
        onConfirmAction={() => mutate({ id: keep.id })}
        isConfirmLoading={isPending}
        title="删除笔记"
        content="确定要删除这个笔记吗？此操作不可逆"
      />
    </motion.div>
  )
}
