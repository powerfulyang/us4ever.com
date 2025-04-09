'use client'

import { Empty } from '@/components/layout/Empty'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { AnimatePresence } from 'framer-motion'
import { TodoItem } from './TodoItem'

export default function TodoList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = api.todo.infinite_list.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  )

  const todos = data?.pages.flatMap(page => page.items) ?? []

  if (isPending) {
    return (
      <LoadingSpinner text="加载中..." />
    )
  }

  if (!todos.length) {
    return <Empty title="暂无待办事项" />
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      loading={isFetchingNextPage}
    >
      <div className="flex gap-4 flex-col">
        <AnimatePresence mode="popLayout">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
            />
          ))}
        </AnimatePresence>
      </div>
    </InfiniteScroll>
  )
}
