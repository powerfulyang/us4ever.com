'use client'

import { useSearchParams } from 'next/navigation'
import { useDebounceValue } from 'usehooks-ts'
import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'
import { MomentItem } from '../components/item'

export default function MomentSearchPage() {
  const searchParams = useSearchParams()
  const initialUrlQuery = searchParams.get('q') || ''
  const [query, setQuery] = useDebounceValue(initialUrlQuery, 500)

  const { isFetching, data = [], error, isSuccess, refetch } = api.moment.search.useQuery({ query })

  const onSearch = () => {
    refetch()
  }

  return (
    <Container
      title="搜索动态"
      description="搜索你感兴趣的动态内容"
    >
      <div className="max-w-[500px] m-auto space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            defaultValue={initialUrlQuery}
            onChange={e => setQuery(e.target.value)}
            placeholder="输入搜索关键词..."
            className="flex-1 rounded-lg bg-white/10 backdrop-blur-lg px-4 py-2 text-white placeholder-gray-400 border border-white/20 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                onSearch()
            }}
          />
          <Button
            onClick={onSearch}
            disabled={!query.trim()}
            isLoading={isFetching}
            variant="default"
            size="sm"
          >
            搜索
          </Button>
        </div>

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
