'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { MdRender } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/trpc/react'
import { MomentItem } from '../moment/components/item'

export default function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  // Keep 搜索
  const {
    isFetching: keepFetching,
    data: keepData = [],
    error: keepError,
    isSuccess: keepSuccess,
    refetch: keepRefetch,
  } = api.keep.search.useQuery({ query }, {
    enabled: !!query,
  })

  // Moment 搜索
  const {
    isFetching: momentFetching,
    data: momentData = [],
    error: momentError,
    isSuccess: momentSuccess,
    refetch: momentRefetch,
  } = api.moment.search.useQuery({ query }, {
    enabled: !!query,
  })

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newQuery = (formData.get('query') as string).trim()

    if (newQuery === query) {
      void keepRefetch()
      void momentRefetch()
      return
    }

    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (newQuery)
      newSearchParams.set('q', newQuery)
    else
      newSearchParams.delete('q')

    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  const isLoading = keepFetching || momentFetching
  const hasResults = (keepData.length > 0) || (momentData.length > 0)

  return (
    <Container
      title="搜索"
      description="搜索笔记和动态内容"
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
            disabled={isLoading}
            isLoading={isLoading}
            variant="default"
            size="sm"
          >
            搜索
          </Button>
        </form>

        {(keepError || momentError) && (
          <p className="text-red-500">
            错误：
            {keepError?.message || momentError?.message}
          </p>
        )}

        {isLoading && <LoadingSpinner text="搜索中..." />}

        {!isLoading && query && (
          <Tabs defaultValue="keeps" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="keeps" className="flex-1">
                笔记 (
                {keepData.length}
                )
              </TabsTrigger>
              <TabsTrigger value="moments" className="flex-1">
                动态 (
                {momentData.length}
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="keeps" className="space-y-4">
              {keepData.length > 0
                ? (
                    <div className="flex flex-col gap-4">
                      {keepData.map(result => (
                        <Link key={result._id} href={`/keep/${result._id}`} target="_blank">
                          <Card className="!p-4 block" hoverable={true}>
                            <h3 className="text-lg font-medium text-purple-300 mb-4">
                              {result._source.title}
                            </h3>
                            <MdRender className="mb-4 text-xs text-gray-400">
                              {result.highlight?.summary?.join('\n\n') || result._source.summary}
                            </MdRender>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )
                : (
                    keepSuccess && (
                      <Empty
                        title="未找到笔记"
                        description={`没有找到与"${query}"相关的笔记。`}
                      />
                    )
                  )}
            </TabsContent>

            <TabsContent value="moments" className="space-y-4">
              {momentData.length > 0
                ? (
                    <div className="flex flex-col gap-4">
                      {momentData.map(moment => (
                        <MomentItem key={moment.id} moment={moment} />
                      ))}
                    </div>
                  )
                : (
                    momentSuccess && (
                      <Empty
                        title="未找到动态"
                        description={`没有找到与"${query}"相关的动态。`}
                      />
                    )
                  )}
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && !query && (
          <Empty title="开始搜索" description="输入关键词搜索笔记和动态内容。" />
        )}
        {!isLoading && !hasResults && (
          <Empty title="没有结果" description="没有找到任何结果" />
        )}
      </div>
    </Container>
  )
}
