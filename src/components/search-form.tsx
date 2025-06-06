'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/utils/cn'

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
    <form onSubmit={handleSubmit} className={cn('relative flex items-center', className)}>
      <input
        type="search"
        placeholder={placeholder || '请输入搜索关键词...'}
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        className={cn(
          'rounded-lg bg-white/10 backdrop-blur-lg text-white placeholder-gray-400 border border-white/20 transition-colors',
          'pl-8 pr-4 py-1.5',
          'focus:border-purple-500/50 focus:outline-none',
          'text-sm flex-1',
        )}
      />
      <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </form>
  )
}
