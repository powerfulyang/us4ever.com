'use client'

import { Confirm } from '@/components/ui/confirm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useState } from 'react'

interface MindMapItem {
  id: string
  title: string
  createdAt: Date
  views: number
  likes: number
}

function MindMapCard({ mindmap }: { mindmap: MindMapItem }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate } = api.mindmap.delete.useMutation({
    onSuccess() {
      return utils.mindmap.list.invalidate()
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(true)
  }

  return (
    <>
      <Link key={mindmap.id} target="_blank" href={`/mindmap/${mindmap.id}`}>
        <div className="flex flex-col rounded-lg border border-gray-200/10 bg-gray-50/5 p-4 shadow-lg">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-100">
              {mindmap.title || '未命名'}
            </h3>
            <div className="mt-2 text-sm text-gray-400">
              创建于
              <span className="pl-1">
                {dayjs(mindmap.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                浏览:
                {mindmap.views}
              </span>
              <span>
                点赞:
                {mindmap.likes}
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
      <div className="mt-8 flex justify-center">
        <LoadingSpinner text="正在获取思维导图..." />
      </div>
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
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.map(mindmap => (
        <MindMapCard key={mindmap.id} mindmap={mindmap} />
      ))}
    </div>
  )
}
