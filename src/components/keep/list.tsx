'use client'

import KeepCard from '@/components/keep/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

export function KeepList() {
  const { isPending, data: notes } = api.keep.list.useQuery()

  if (isPending) {
    return <LoadingSpinner text="正在获取笔记..." />
  }

  if (!notes?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-center mb-2">
          还没有任何笔记
        </h3>
        <p className="text-sm text-gray-400 text-center">快来创建你的第一个笔记吧</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-6 pb-10">
      {notes.map(note => (
        <KeepCard key={note.id} note={note} />
      ))}
    </div>
  )
}
