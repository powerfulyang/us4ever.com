'use client'

import { MdRender } from '@/components/md-render'
import { Confirm } from '@/components/ui/confirm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card } from '../ui/card'

function KeepCard({ keep }: { keep: any }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.keep.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      return utils.keep.list.invalidate()
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  return (
    <>
      <Link href={`/keep/${keep.id}`} className="children-pointer">
        <Card className="flex flex-col px-6 py-3 gap-2 hover:scale-[1.02] transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex gap-3">
            <span className="text-gray-100 font-semibold text-lg line-clamp-1">{keep.title}</span>
          </div>
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
          <MdRender className="text-xs">
            {keep.summary}
          </MdRender>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                浏览:
                <span className="pl-1">{keep.views}</span>
              </span>
              <span>
                点赞:
                <span className="pl-1">{keep.likes}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-400"
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
          </div>
        </Card>
      </Link>
      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => mutate({ id: keep.id })}
        isConfirmLoading={isPending}
        title="删除笔记"
        content="确定要删除这个笔记吗？此操作不可逆"
      />
    </>
  )
}

export function KeepList() {
  const { isPending, data: keepList } = api.keep.list.useQuery()

  if (isPending) {
    return <LoadingSpinner text="正在获取笔记..." />
  }

  if (!keepList?.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-1 py-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-center mb-2">
          还没有任何笔记
        </h3>
        <p className="text-sm text-gray-400 text-center">快来创建你的第一个笔记吧</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center mt-6">
      <div className="flex flex-col gap-6 max-w-3xl w-full">
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
    </div>
  )
}
