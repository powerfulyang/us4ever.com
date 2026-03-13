'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { Confirm } from '@/components/ui/confirm'
import { ContentCard } from '@/components/ui/content-card'
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
}

interface KeepCardProps {
  keep: Keep
  onDelete?: () => void
}

export function KeepCard({ keep, onDelete }: KeepCardProps) {
  const router = useRouter()
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

  const handleDelete = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setShowConfirm(true)
  }

  const handleCardClick = () => {
    router.push(`/keep/${keep.id}`)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <ContentCard
        title={keep.title}
        status={{
          label: keep.isPublic ? '公开' : '私密',
          type: keep.isPublic ? 'success' : 'warning',
        }}
        content={keep.summary}
        createdAt={keep.createdAt}
        views={keep.views}
        likes={keep.likes}
        ownerId={keep.ownerId}
        onDelete={handleDelete}
        onClick={handleCardClick}
        className="cursor-pointer"
      />
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
