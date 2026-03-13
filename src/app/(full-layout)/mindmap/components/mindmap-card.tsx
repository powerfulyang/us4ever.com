'use client'

import Link from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import { Confirm } from '@/components/ui/confirm'
import { ContentCard } from '@/components/ui/content-card'
import { api } from '@/trpc/react'

interface MindMap {
  id: string
  title: string
  summary?: string
  isPublic: boolean
  views: number
  likes: number
  ownerId: string
  createdAt: Date
}

interface MindMapCardProps {
  mindmap: MindMap
  onDelete?: () => void
}

export function MindMapCard({ mindmap, onDelete }: MindMapCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.mindMap.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      if (onDelete) {
        onDelete()
      }
      else {
        return utils.mindMap.fetchByCursor.invalidate()
      }
    },
  })

  const handleDelete = (e?: React.MouseEvent) => {
    e?.preventDefault()
    setShowConfirm(true)
  }

  return (
    <>
      <Link href={`/mindmap/${mindmap.id}`} className="children-pointer block h-full">
        <ContentCard
          title={mindmap.title}
          status={{
            label: mindmap.isPublic ? '公开' : '私密',
            type: mindmap.isPublic ? 'success' : 'warning',
          }}
          content={mindmap.summary || ''}
          createdAt={mindmap.createdAt}
          views={mindmap.views}
          likes={mindmap.likes}
          ownerId={mindmap.ownerId}
          onDelete={handleDelete}
        />
      </Link>
      <Confirm
        isOpen={showConfirm}
        onCloseAction={() => setShowConfirm(false)}
        onConfirmAction={() => mutate({ id: mindmap.id })}
        isConfirmLoading={isPending}
        title="删除思维导图"
        content="确定要删除这个思维导图吗？此操作不可逆"
      />
    </>
  )
}
