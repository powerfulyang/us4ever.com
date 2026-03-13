'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { MdRender } from '@/components/md-render'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

export default function KeepSearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const { isFetching, data = [], error, isSuccess, refetch } = api.keep.search.useQuery({ query }, {
    enabled: !!query,
  })

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
      title="搜索笔记"
      description="通过关键词搜索你的笔记"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <form className="flex gap-2" onSubmit={onSearch}>
          <Input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="输入搜索关键词..."
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isFetching}
            isLoading={isFetching}
          >
            搜索
          </Button>
        </form>

        {error && (
          <p className="text-destructive">
            错误:
            {error.message}
          </p>
        )}

        {isFetching && <LoadingSpinner text="搜索中..." />}

        {!isFetching && data.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.map((result) => {
              return (
                <Link key={result._id} href={`/keep/${result._id}`} target="_blank">
                  <Card hoverable>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-primary">
                        {result._source.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MdRender className="text-sm text-muted-foreground">
                        {result.highlight?.summary?.join('\n\n') || result._source.summary}
                      </MdRender>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!isFetching && isSuccess && data.length === 0 && (
          <Empty title="未找到结果" description={`没有找到与 "${query}" 相关的笔记`} />
        )}
      </div>
    </Container>
  )
}
