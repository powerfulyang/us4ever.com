'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import { Empty } from '@/components/layout/Empty'
import { Confirm } from '@/components/ui/confirm'
import { ContentCard } from '@/components/ui/content-card'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

function MindMapCard({ mindmap }: { mindmap: any }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const utils = api.useUtils()
  const { mutate, isPending } = api.mindMap.delete.useMutation({
    onSuccess() {
      setShowConfirm(false)
      return utils.mindMap.infinite_list.invalidate()
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
        onCloseAction={() => setShowConfirm(false)}
        onConfirmAction={() => mutate({ id: mindmap.id })}
        isConfirmLoading={isPending}
        title="删除思维导图"
        content="确定要删除这个思维导图吗？此操作不可逆"
      />
    </motion.div>
  )
}

export function MindMapList() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.mindMap.infinite_list.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  if (isLoading) {
    return <LoadingSpinner text="正在获取思维导图..." />
  }

  if (!data?.pages[0]?.items.length) {
    return (
      <Empty title="暂无思维导图" />
    )
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      loading={isFetchingNextPage}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {data.pages.map(page =>
            page.items.map(mindMap => (
              <MindMapCard key={mindMap.id} mindmap={mindMap} />
            )),
          )}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  )
}
