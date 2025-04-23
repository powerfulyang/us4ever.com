'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MomentSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim())
      return
    router.push(`/moment/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="支持搜索内容和图片文字"
        className="flex-1 rounded-lg bg-white/10 backdrop-blur-lg px-4 py-2 text-white placeholder-gray-400 border border-white/20 focus:border-purple-500/50 focus:outline-none transition-colors"
        onKeyDown={(e) => {
          if (e.key === 'Enter')
            handleSearch()
        }}
      />
      <Button
        onClick={handleSearch}
        disabled={!query.trim()}
        variant="default"
        size="sm"
      >
        搜索
      </Button>
    </div>
  )
}
