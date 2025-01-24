'use client'

import { Empty } from '@/components/layout/Empty'
import { Confirm } from '@/components/ui/confirm'
import { ContentCard } from '@/components/ui/content-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'

function MindMapCard({ mindmap }: { mindmap: any }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.mindmap.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      return utils.mindmap.list.invalidate()
    },
  })

  const handleDelete = (e?: React.MouseEvent) => {
    e?.preventDefault()
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
      <Link href={`/mindmap/${mindmap.id}`} className="children-pointer block h-full">
        <ContentCard
          title={mindmap.title}
          status={{
            label: mindmap.isPublic ? '公开' : '私密',
            type: mindmap.isPublic ? 'success' : 'default',
          }}
          content={mindmap.summary}
          createdAt={mindmap.createdAt}
          views={mindmap.views}
          likes={mindmap.likes}
          ownerId={mindmap.ownerId}
          onDelete={handleDelete}
        />
      </Link>
      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => mutate({ id: mindmap.id })}
        isConfirmLoading={isPending}
        title="删除思维导图"
        content="确定要删除这个思维导图吗？此操作不可逆"
      />
    </motion.div>
  )
}

export function MindMapList() {
  const { isPending, data: mindmapList } = api.mindmap.list.useQuery()

  if (isPending) {
    return <LoadingSpinner text="正在获取思维导图..." />
  }

  if (!mindmapList?.length) {
    return (
      <Empty title="暂无思维导图" />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {mindmapList.map(mindmap => (
          <MindMapCard key={mindmap.id} mindmap={mindmap} />
        ))}
      </AnimatePresence>
    </div>
  )
}
