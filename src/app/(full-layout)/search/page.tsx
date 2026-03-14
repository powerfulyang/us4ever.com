'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Globe, Loader2, Lock, MessageSquare, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { MdRender } from '@/components/md-render'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'
import { MomentItem } from '../moment/components/item'

type FilterType = 'all' | 'keep' | 'moment'

export default function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const filter = (searchParams.get('type') as FilterType) || 'all'

  // Keep 搜索
  const {
    isFetching: keepFetching,
    data: keepData = [],
    error: keepError,
    isSuccess: keepSuccess,
  } = api.keep.search.useQuery({ query }, {
    enabled: !!query && (filter === 'all' || filter === 'keep'),
  })

  // Moment 搜索
  const {
    isFetching: momentFetching,
    data: momentData = [],
    error: momentError,
    isSuccess: momentSuccess,
  } = api.moment.search.useQuery({ query }, {
    enabled: !!query && (filter === 'all' || filter === 'moment'),
  })

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newQuery = (formData.get('query') as string).trim()

    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (newQuery) {
      newSearchParams.set('q', newQuery)
    }
    else {
      newSearchParams.delete('q')
    }

    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  const handleFilterChange = (newFilter: FilterType) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (newFilter === 'all') {
      newSearchParams.delete('type')
    }
    else {
      newSearchParams.set('type', newFilter)
    }
    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  const isLoading = keepFetching || momentFetching
  const hasError = keepError || momentError

  // 合并并排序结果
  const combinedResults = React.useMemo(() => {
    if (!query)
      return []

    const keeps = keepData.map(item => ({
      ...item,
      _type: 'keep' as const,
      _sortTime: item._source.updatedAt || item._source.createdAt,
      resultId: item._id,
    }))

    const moments = momentData.map(item => ({
      ...item,
      _type: 'moment' as const,
      _sortTime: item.updatedAt || item.createdAt,
      resultId: item.id,
    }))

    let results = [...keeps, ...moments]

    // 根据 filter 筛选结果
    if (filter === 'keep') {
      results = results.filter(item => item._type === 'keep')
    }
    else if (filter === 'moment') {
      results = results.filter(item => item._type === 'moment')
    }

    return results.sort(
      (a, b) => new Date(b._sortTime).getTime() - new Date(a._sortTime).getTime(),
    )
  }, [keepData, momentData, query, filter])

  const totalCount = keepData.length + momentData.length

  // 筛选按钮配置
  const filterButtons: { type: FilterType, label: string, icon: React.ReactNode, count: number }[] = [
    { type: 'all', label: '全部', icon: <Search className="w-4 h-4" />, count: totalCount },
    { type: 'keep', label: '笔记', icon: <FileText className="w-4 h-4" />, count: keepData.length },
    { type: 'moment', label: '动态', icon: <MessageSquare className="w-4 h-4" />, count: momentData.length },
  ]

  return (
    <Container
      title="搜索"
      description="搜索笔记和动态内容"
    >
      <div className="space-y-6">
        {/* 搜索标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">搜索内容</h1>
          <p className="text-muted-foreground">快速查找你的笔记和动态</p>
        </div>

        {/* 大型搜索框 */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-2xl mx-auto"
          onSubmit={onSearch}
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="输入关键词搜索笔记、动态..."
              className="w-full h-14 pl-12 pr-32 text-lg bg-background border-2 border-border/50 rounded-2xl shadow-sm hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl"
            >
              {isLoading
                ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      搜索中
                    </>
                  )
                : (
                    '搜索'
                  )}
            </Button>
          </div>
        </motion.form>

        {/* 快捷筛选标签 */}
        {query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {filterButtons.map(btn => (
              <Button
                key={btn.type}
                variant={filter === btn.type ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(btn.type)}
                className="gap-2 rounded-full"
              >
                {btn.icon}
                {btn.label}
                {btn.count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                    {btn.count}
                  </Badge>
                )}
              </Button>
            ))}
          </motion.div>
        )}

        {/* 错误提示 */}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-destructive/10 text-destructive text-center"
          >
            <p>
              搜索出错：
              {keepError?.message || momentError?.message}
            </p>
          </motion.div>
        )}

        {/* Loading 状态 */}
        {isLoading && query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">搜索中...</p>
          </motion.div>
        )}

        {/* 搜索结果 */}
        <AnimatePresence mode="wait">
          {!isLoading && query && (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 max-w-3xl mx-auto"
            >
              {/* 结果统计 */}
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <span>
                  找到
                  {totalCount}
                  {' '}
                  个结果
                </span>
                {totalCount > 0 && (
                  <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      笔记
                      {' '}
                      {keepData.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      动态
                      {' '}
                      {momentData.length}
                    </span>
                  </span>
                )}
              </div>

              {/* 统一结果列表 */}
              {combinedResults.length > 0
                ? (
                    <div className="space-y-3">
                      {combinedResults.map((result, index) => (
                        <motion.div
                          key={`${result._type}-${result.resultId}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {result._type === 'keep'
                            ? (
                                // 笔记结果卡片 - 简洁优雅设计
                                <Link href={`/keep/${result.resultId}`}>
                                  <Card
                                    hoverable
                                    className="group relative overflow-hidden rounded-md transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer"
                                  >
                                    {/* 左侧色条指示器 */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                                    <div className="pl-5 pr-4 py-4">
                                      {/* 标题行 */}
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
                                          {result._source.title}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <Badge
                                            variant={result._source.isPublic ? 'success' : 'warning'}
                                            className="text-[10px] h-5 px-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider"
                                          >
                                            {result._source.isPublic
                                              ? <Globe className="w-3 h-3" />
                                              : <Lock className="w-3 h-3" />}
                                            {result._source.isPublic ? '公开' : '私密'}
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* 摘要 */}
                                      {result.highlight?.summary
                                        ? (
                                            <div className="text-sm text-muted-foreground line-clamp-5 mb-4 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-lg px-2 py-1.5 -mx-0.5">
                                              <MdRender className="[&>*]:text-muted-foreground [&>*]:text-sm">
                                                {result.highlight.summary.join('...')}
                                              </MdRender>
                                            </div>
                                          )
                                        : result._source.summary
                                          ? (
                                              <p className="text-sm text-muted-foreground line-clamp-5 mb-4 leading-relaxed">
                                                {result._source.summary}
                                              </p>
                                            )
                                          : null}

                                      {/* 底部元信息 */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          {result._source.category && (
                                            <span className="flex items-center gap-1 text-blue-600/80 dark:text-blue-400/80">
                                              <span className="w-1 h-1 rounded-full bg-current" />
                                              {result._source.category}
                                            </span>
                                          )}
                                        </div>

                                        {/* 悬停显示箭头 */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                </Link>
                              )
                            : (
                                // 动态结果卡片
                                <MomentItem moment={result} />
                              )}
                        </motion.div>
                      ))}
                    </div>
                  )
                : (
                    // 无结果
                    !hasError && (keepSuccess || momentSuccess) && (
                      <Empty
                        title="未找到结果"
                        description={`没有找到与"${query}"相关的内容。尝试其他关键词？`}
                        className="py-12"
                      />
                    )
                  )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 初始状态 */}
        {!isLoading && !query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">开始搜索</h3>
            <p className="text-muted-foreground max-w-sm">
              输入关键词搜索你的笔记和动态内容，支持标题、正文内容搜索
            </p>
          </motion.div>
        )}
      </div>
    </Container>
  )
}
