'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { parseXMindFile } from '@/lib/xmind'
import { api } from '@/trpc/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

export default function MindMapPage() {
  const [file, setFile] = useState<File | null>(null)

  const { data: mindmaps, isLoading } = api.mindmap.list.useQuery()
  const { isPending, mutate } = api.mindmap.createByXmind.useMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.xmind')) {
        toast.error('请上传 .xmind 文件')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file)
      return
    const content = await parseXMindFile(file)
    mutate({
      content,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6">
            <h3 className="text-2xl font-semibold">上传思维导图</h3>
            <div className="mt-4">
              <label htmlFor="xmind" className="block text-sm font-medium mb-2">
                选择 XMind 文件
              </label>
              <input
                id="xmind"
                type="file"
                accept=".xmind"
                onChange={handleFileChange}
                disabled={isPending}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isPending}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? '上传中...' : '上传'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? (
              <div className="col-span-full flex justify-center">
                <LoadingSpinner text="加载中..." />
              </div>
            )
          : mindmaps?.length === 0
            ? (
                <div className="col-span-full text-center text-gray-500">
                  暂无思维导图
                </div>
              )
            : (
                mindmaps?.map(mindmap => (
                  <div
                    key={mindmap.id}
                    className="rounded-lg border bg-white shadow-sm flex flex-col"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {mindmap.title || '未命名'}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500">
                        创建于
                        {new Date(mindmap.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          浏览:
                          {mindmap.views}
                        </span>
                        <span>
                          点赞:
                          {mindmap.likes}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto p-6 pt-0">
                      <Link href={`/mindmap/${mindmap.id}`}>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          查看
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
      </div>
    </div>
  )
}
