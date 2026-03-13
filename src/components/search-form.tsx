'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchFormProps {
  searchPath: string
  initialQuery?: string
  className?: string
  placeholder?: string
}

export function SearchForm({
  searchPath,
  initialQuery = '',
  className,
  placeholder,
}: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder || '请输入搜索关键词...'}
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        className="pl-9 h-9 w-full sm:w-64"
      />
    </form>
  )
}

export function SearchFormMobile({ searchPath, className, ...props }: SearchFormProps) {
  const router = useRouter()

  return (
    <>
      <div className="sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.push(searchPath)
          }}
          className={cn('h-9 w-9', className)}
        >
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">搜索</span>
        </Button>
      </div>
      <SearchForm
        searchPath={searchPath}
        {...props}
        className={cn('hidden sm:block', className)}
      />
    </>
  )
}
