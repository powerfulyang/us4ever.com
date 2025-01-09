'use client'

import type { MindMap } from '@prisma/client'
import { MdRender } from '@/components/md-render'
import { Confirm } from '@/components/ui/confirm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import Link from 'next/link'
import React, { useState } from 'react'

function MindMapCard({ mindmap }: { mindmap: MindMap }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.mindmap.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      return utils.mindmap.list.invalidate()
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  return (
    <>
      <Link key={mindmap.id} target="_blank" href={`/mindmap/${mindmap.id}`} className="children-pointer">
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200/10 bg-gray-50/5 p-4 shadow-lg">
          <div className="flex flex-col gap-2">
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-100">
              {mindmap.title || '未命名'}
            </h3>
            <div className="flex gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded ${mindmap.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}
              >
                {mindmap.isPublic ? '公开' : '私密'}
              </span>
              <time className="text-sm text-gray-400">
                {dayjs(mindmap.createdAt).format('YYYY-MM-DD HH:mm')}
              </time>
            </div>
            <MdRender className="text-xs">
              {mindmap.summary}
            </MdRender>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                浏览:
                <span className="pl-1">{mindmap.views}</span>
              </span>
              <span>
                点赞:
                <span className="pl-1">{mindmap.likes}</span>
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
        </div>
      </Link>
      <Confirm
        isOpen={showConfirm}
        isConfirmLoading={isPending}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => mutate({ id: mindmap.id })}
        title="删除思维导图"
        content="确定要删除这个思维导图吗？此操作不可恢复。"
      />
    </>
  )
}

export function MindMapList() {
  const { isPending, data: list } = api.mindmap.list.useQuery()

  if (isPending) {
    return (
      <LoadingSpinner text="正在获取思维导图..." />
    )
  }
  if (!list?.length) {
    return (
      <div className="mt-32 flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-center">
          <p className="text-gray-400">暂无思维导图</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {list.map(mindmap => (
        <MindMapCard key={mindmap.id} mindmap={mindmap} />
      ))}
    </div>
  )
}
