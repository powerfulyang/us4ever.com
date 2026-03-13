'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileText, MessageSquare, Search, Tag } from 'lucide-react'
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
    }))

    const moments = momentData.map(item => ({
      ...item,
      _type: 'moment' as const,
      _sortTime: item.updatedAt || item.createdAt,
    }))

    return [...keeps, ...moments].sort(
      (a, b) => new Date(b._sortTime).getTime() - new Date(a._sortTime).getTime(),
    )
  }, [keepData, momentData, query])

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
              搜索
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

        {/* 搜索结果 */}
        <AnimatePresence mode="wait">
          {!isLoading && query && (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
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
              {combinedResults.length > 0 ? (
                <div className="space-y-3">
                  {combinedResults.map((result, index) => (
                    <motion.div
                      key={`${result._type}-${result._id || result.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {result._type === 'keep' ? (
                        // 笔记结果卡片
                        <Link href={`/keep/${result._id}`}>
                          <Card
                            hoverable
                            className="group p-5 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex items-start gap-4">
                              {/* 类型图标 */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <FileText className="w-5 h-5 text-blue-500" />
                              </div>

                              {/* 内容区域 */}
                              <div className="flex-1 min-w-0 space-y-2">
                                {/* 标题和标签 */}
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {result._source.title}
                                  </h3>
                                  {result._source.isPublic
                                    ? (
                                        <Badge variant="outline" className="text-xs">
                                          公开
                                        </Badge>
                                      )
                                    : (
                                        <Badge variant="secondary" className="text-xs">
                                          私密
                                        </Badge>
                                      )}
                                </div>

                                {/* 摘要 */}
                                {result.highlight?.summary
                                  ? (
                                      <MdRender className="text-sm text-muted-foreground line-clamp-2">
                                        {result.highlight.summary.join('...')}
                                      </MdRender>
                                    )
                                  : result._source.summary
                                    ? (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                          {result._source.summary}
                                        </p>
                                      )
                                    : null}

                                {/* 元信息 */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {result._source.category && (
                                    <span className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {result._source.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ) : (
                        // 动态结果卡片
                        <MomentItem moment={result} />
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
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
