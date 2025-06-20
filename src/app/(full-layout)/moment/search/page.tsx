'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { MomentItem } from '../components/item'

export default function MomentSearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const { isFetching, data = [], error, isSuccess, refetch } = api.moment.search.useQuery(
    { query },
    {
      enabled: !!query,
    },
  )

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newQuery = (formData.get('query') as string).trim()

    if (newQuery === query) {
      void refetch()
      return
    }

    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (newQuery)
      newSearchParams.set('q', newQuery)
    else
      newSearchParams.delete('q')

    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  return (
    <Container
      title="搜索动态"
      description="搜索你感兴趣的动态内容"
    >
      <div className="max-w-[500px] m-auto space-y-4">
        <form className="flex gap-2" onSubmit={onSearch}>
          <Input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="输入搜索关键词..."
            className="flex-1 rounded-lg bg-white/10 backdrop-blur-lg px-4 py-2 text-white placeholder-gray-400 border border-white/20 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
          />
          <Button
            type="submit"
            disabled={isFetching}
            isLoading={isFetching}
            variant="default"
            size="sm"
          >
            搜索
          </Button>
        </form>

        {error && (
          <p className="text-red-500">
            错误：
            {error.message}
          </p>
        )}

        {isFetching && <LoadingSpinner text="搜索中..." />}

        {!isFetching && data.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.map(moment => (
              <MomentItem key={moment.id} moment={moment} />
            ))}
          </div>
        )}

        {!isFetching && isSuccess && data.length === 0 && (
          <Empty title="未找到结果" description={`没有找到与"${query}"相关的动态。`} />
        )}
      </div>
    </Container>
  )
}
