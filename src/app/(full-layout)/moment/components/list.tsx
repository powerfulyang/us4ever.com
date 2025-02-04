'use client'

import { Empty } from '@/components/layout/Empty'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { AnimatePresence } from 'framer-motion'
import { MomentItem } from './item'

export function MomentList() {
  const { data: moments, isPending } = api.moment.list.useQuery()

  if (isPending)
    return <LoadingSpinner text="加载动态..." />

  if (!moments?.length)
    return <Empty title="暂无动态" />

  return (
    <div className="space-y-6 mx-auto">
      <AnimatePresence mode="popLayout">
        {moments.map(moment => (
          <MomentItem key={moment.id} moment={moment} />
        ))}
      </AnimatePresence>
    </div>
  )
}
