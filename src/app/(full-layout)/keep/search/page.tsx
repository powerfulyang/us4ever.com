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
      title="Search Keeps"
      description="Find notes by searching their content."
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
            Search
          </Button>
        </form>

        {error && (
          <p className="text-red-500">
            Error:
            {error.message}
          </p>
        )}

        {isFetching && <LoadingSpinner text="Searching..." />}

        {!isFetching && data.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.map((result) => {
              return (
                <Link key={result._id} href={`/keep/${result._id}`} target="_blank">
                  <Card className="!p-4 block" hoverable={true}>
                    <h3 className="text-lg font-medium text-purple-300 mb-4">
                      {result._source.title}
                    </h3>
                    <MdRender className="mb-4 text-xs text-gray-400">
                      {result.highlight?.summary?.join('\n\n') || result._source.summary}
                    </MdRender>
                    <MdRender className="text-sm">
                      {result.highlight?.content?.join('\n\n') || ''}
                    </MdRender>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!isFetching && isSuccess && data.length === 0 && (
          <Empty title="No results found" description={`No keeps match your search for "${query}".`} />
        )}
      </div>
    </Container>
  )
}
