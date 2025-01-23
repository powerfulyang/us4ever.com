'use client'

import { MdRender } from '@/components/md-render'
import { Card } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { Divider } from '@/components/ui/divider'
import { ItemActions } from '@/components/ui/item-actions'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import { Empty } from '../layout/Empty'

function KeepCard({ keep }: { keep: any }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.keep.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      return utils.keep.list.invalidate()
    },
  })

  const handleDelete = (e?: React.MouseEvent) => {
    e?.preventDefault()
    setShowConfirm(true)
  }

  return (
    <Link href={`/keep/${keep.id}`} className="children-pointer block h-full">
      <Card hoverable className="flex flex-col gap-2 h-full">
        <span className="text-gray-100 font-semibold text-lg line-clamp-1">{keep.title}</span>
        <div className="flex gap-3">
          <span
            className={`text-xs px-2 py-0.5 rounded ${keep.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}
          >
            {keep.isPublic ? '公开' : '私密'}
          </span>
          <time className="text-sm text-gray-400">
            {dayjs(keep.createdAt).format('YYYY-MM-DD HH:mm')}
          </time>
        </div>
        <MdRender className="text-sm">
          {keep.summary}
        </MdRender>
        <div className="mt-auto">
          <Divider className="mb-3 mt-1" />
          <ItemActions
            views={keep.views}
            likes={keep.likes}
            ownerId={keep.ownerId}
            onDelete={handleDelete}
          />
        </div>
      </Card>
      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => mutate({ id: keep.id })}
        isConfirmLoading={isPending}
        title="删除笔记"
        content="确定要删除这个笔记吗？此操作不可逆"
      />
    </Link>
  )
}

export function KeepList() {
  const { isPending, data: keepList } = api.keep.list.useQuery()

  if (isPending) {
    return <LoadingSpinner text="正在获取笔记..." />
  }

  if (!keepList?.length) {
    return (
      <Empty title="暂无笔记" />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {keepList.map(keep => (
        <motion.div
          key={keep.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <KeepCard keep={keep} />
        </motion.div>
      ))}
    </div>
  )
}
