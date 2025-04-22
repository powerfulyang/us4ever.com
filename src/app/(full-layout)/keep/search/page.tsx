'use client'

import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { Fragment, useEffect, useState } from 'react'

interface SearchResult {
  id: string
  score: number
  title: string
  summary: string
  content: string
}

// Helper function to generate a content snippet around the first query match
function generateContentSnippet(content: string | null | undefined, query: string, maxLength: number): string {
  if (!content)
    return ''
  const cleanedContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleanedContent)
    return ''

  const queryLower = query.toLowerCase().trim()
  if (!queryLower) { // Handle empty query: Fallback to simple truncation
    return cleanedContent.length <= maxLength ? cleanedContent : `${cleanedContent.substring(0, maxLength)}...`
  }

  const contentLower = cleanedContent.toLowerCase()
  const queryIndex = contentLower.indexOf(queryLower)

  let snippet: string
  if (queryIndex === -1) {
    // Query not found: Truncate from the beginning
    snippet = cleanedContent.length <= maxLength ? cleanedContent : `${cleanedContent.substring(0, maxLength)}...`
  }
  else {
    // Query found: Generate snippet around the keyword
    const keywordLength = queryLower.length
    // Aim for roughly half the context on each side
    const contextEachSide = Math.floor((maxLength - keywordLength) / 2)

    let startIndex = Math.max(0, queryIndex - contextEachSide)
    let endIndex = Math.min(cleanedContent.length, queryIndex + keywordLength + contextEachSide)

    // Adjust window if it bumps against the start or end
    if (startIndex === 0) {
      endIndex = Math.min(cleanedContent.length, maxLength)
    }
    else if (endIndex === cleanedContent.length) {
      startIndex = Math.max(0, cleanedContent.length - maxLength)
    }

    snippet = cleanedContent.substring(startIndex, endIndex)

    // Add ellipsis if the snippet doesn't include the start/end of the content
    if (startIndex > 0) {
      snippet = `... ${snippet}`
    }
    if (endIndex < cleanedContent.length) {
      snippet = `${snippet} ...`
    }
  }
  return snippet
}

function HighlightedText({ text, query }: { text: string | null | undefined, query: string }) {
  if (!query || !text) {
    return <>{text}</>
  }

  try {
    const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(escapedQuery, 'gi')
    const matches = [...text.matchAll(regex)]

    if (matches.length === 0) {
      return <>{text}</>
    }

    const result: React.ReactNode[] = []
    let lastIndex = 0

    matches.forEach((match) => {
      const index = match.index!
      const matchedText = match[0]

      if (index > lastIndex) {
        result.push(<Fragment>{text.substring(lastIndex, index)}</Fragment>)
      }

      result.push(
        <span className="bg-purple-300 text-purple-900 rounded px-[2px] py-[1px]">
          {matchedText}
        </span>,
      )

      lastIndex = index + matchedText.length
    })

    if (lastIndex < text.length) {
      result.push(<Fragment key="text-end">{text.substring(lastIndex)}</Fragment>)
    }

    return <>{result}</>
  }
  catch (error) {
    console.error('Error during highlighting:', error)
    return <>{text}</>
  }
}

async function searchKeeps(searchTerm: string): Promise<SearchResult[]> {
  const response = await fetch(`https://api.us4ever.com/keeps/search?q=${encodeURIComponent(searchTerm)}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return (await response.json() || [])
}

export default function KeepSearchPage() {
  const searchParams = useSearchParams()
  const initialUrlQuery = searchParams.get('q')
  const [query, setQuery] = useState(initialUrlQuery || '')

  const { isPending, mutate, error, data = [], isIdle, isSuccess } = useMutation({
    mutationFn: searchKeeps,
  })

  useEffect(() => {
    if (initialUrlQuery) {
      mutate(initialUrlQuery.trim())
    }
  }, [initialUrlQuery, mutate])

  const onSearch = () => {
    const searchTerm = query.trim()
    if (!searchTerm)
      return
    mutate(searchTerm)
  }

  return (
    <Container
      title="Search Keeps"
      description="Find notes by searching their content."
    >
      <div className="max-w-[500px] m-auto space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter search term..."
            className="flex-1 rounded-lg bg-white/10 backdrop-blur-lg px-4 py-2 text-white placeholder-gray-400 border border-white/20 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                onSearch()
            }}
          />
          <Button
            onClick={onSearch}
            disabled={!query.trim() || isPending}
            isLoading={isPending}
            variant="default"
            size="sm"
          >
            Search
          </Button>
        </div>

        {error && (
          <p className="text-red-500">
            Error:
            {error.message}
          </p>
        )}

        {isPending && <LoadingSpinner text="Searching..." />}

        {!isPending && data.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.map((result) => {
              const contentSnippet = generateContentSnippet(result.content, query, 150)
              return (
                <Link key={result.id} href={`/keep/${result.id}`} target="_blank">
                  <Card className="!p-4 block" hoverable={true}>
                    <h3 className="text-lg font-medium text-purple-300">
                      <HighlightedText text={result.title} query={query} />
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Score:
                      {result.score.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      <HighlightedText text={result.summary} query={query} />
                    </p>
                    {contentSnippet && contentSnippet !== result.summary && (
                      <p className="text-sm text-gray-300 mt-2">
                        <HighlightedText text={contentSnippet} query={query} />
                      </p>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {!isPending && isSuccess && data.length === 0 && (
          <Empty title="No results found" description={`No keeps match your search for "${query}".`} />
        )}

        {!isPending && isIdle && (
          <Empty title="Start searching" description="Enter a term above to find relevant keeps." />
        )}
      </div>
    </Container>
  )
}
