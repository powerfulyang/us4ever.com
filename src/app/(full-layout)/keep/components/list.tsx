'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { Empty } from '@/components/layout/Empty'
import { Confirm } from '@/components/ui/confirm'
import { ContentCard } from '@/components/ui/content-card'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

function KeepCard({ keep }: { keep: any }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.keep.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      return utils.keep.fetchByCursor.invalidate()
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

interface KeepListProps {
  category?: string
}

export function KeepList({ category }: KeepListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.keep.fetchByCursor.useInfiniteQuery(
    { category },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  const allKeeps = data?.pages.flatMap(page => page.items) ?? []

  if (isLoading) {
    return <LoadingSpinner text="正在获取笔记..." />
  }

  if (!allKeeps.length && !isLoading) {
    return (
      <Empty title="暂无笔记" />
    )
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      loading={isFetchingNextPage}
      hasMore={hasNextPage}
      error={!!error}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {allKeeps.map(keep => (
            <KeepCard key={keep.id} keep={keep} />
          ))}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  )
}
