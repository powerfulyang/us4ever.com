'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Input } from './ui'

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
    <form onSubmit={handleSubmit} className={cn(className)}>
      <Input
        inputSize="sm"
        type="search"
        placeholder={placeholder || '请输入搜索关键词...'}
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        leftIcon={
          <SearchIcon className="h-4 w-4" />
        }
      />
    </form>
  )
}
