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

export function SearchFormMobile({ searchPath, className, ...props }: SearchFormProps) {
  const router = useRouter()
  return (
    <>
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => {
            router.push(searchPath)
          }}
          className={cn(
            'group relative overflow-hidden rounded-full p-2',
            'bg-white/10 backdrop-blur-sm',
            'active:scale-95 transition-all duration-200',
            className,
          )}
        >
          <SearchIcon className="h-5.5 w-5.5 text-white/70" />
        </button>
      </div>
      <SearchForm
        searchPath={searchPath}
        {...props}
        className={cn('hidden sm:block', className)}
      />
    </>
  )
}
