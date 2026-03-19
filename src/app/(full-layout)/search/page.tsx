'use client'

import type { Moment as MomentType } from '@/server/api/routers/moment'
import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Database, FileText, Globe, Loader2, Lock, MessageSquare, Search, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { toast } from 'react-toastify'
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
type SearchMode = 'keyword' | 'semantic' | 'hybrid'

/**
 * 统一的搜索结果项接口
 */
interface UnifiedResultBase {
  _type: 'keep' | 'moment'
  id: string
  similarity?: number
  score?: number
  matchType?: 'keyword' | 'semantic' | 'both'
  _sortTime?: string
}

interface KeepResult extends UnifiedResultBase {
  _type: 'keep'
  title: string | null
  summary: string | null
  content: string | null
  category: string
  isPublic: boolean
  highlight_title?: string
  highlight_summary?: string
  highlight_content?: string
}

interface MomentResult extends UnifiedResultBase, MomentType {
  _type: 'moment'
}

type UnifiedResult = KeepResult | MomentResult

function SemanticSearchResultCard({ result }: {
  result: {
    id: string
    title?: string
    summary?: string
    content?: string
    category: string
    isPublic: boolean
    similarity: number
    matchType?: 'keyword' | 'semantic' | 'both'
    highlight_title?: string
    highlight_summary?: string
    highlight_content?: string
  }
}) {
  const similarityPercent = Math.round((result.similarity || 0) * 100)

  return (
    <Link href={`/keep/${result.id}`}>
      <Card
        hoverable
        className="group relative overflow-hidden rounded-md transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer"
      >
        {/* 左侧色条 - 根据相似度改变颜色 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(to bottom, ${
              similarityPercent > 70 ? '#22c55e' : similarityPercent > 50 ? '#eab308' : '#3b82f6'
            }, ${
              similarityPercent > 70 ? '#16a34a' : similarityPercent > 50 ? '#ca8a04' : '#6366f1'
            })`,
          }}
        />

        <div className="pl-5 pr-4 py-4">
          {/* 标题行 */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
              {result.highlight_title
                ? (
                    <MdRender as="span" noMargin className="inline-block p-0 !m-0">{result.highlight_title}</MdRender>
                  )
                : (
                    result.title || '无标题'
                  )}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {/* 相似度徽章 */}
              <Badge
                variant={similarityPercent > 70 ? 'success' : 'secondary'}
                className="text-[10px] h-5 px-1.5 flex items-center gap-1 font-mono"
              >
                <Sparkles className="w-3 h-3" />
                {similarityPercent}
                %
              </Badge>
              {/* 匹配类型 */}
              {result.matchType && (
                <Badge
                  variant={result.matchType === 'both' ? 'default' : 'outline'}
                  className="text-[10px] h-5 px-1.5"
                >
                  {result.matchType === 'both' ? '双匹配' : result.matchType === 'keyword' ? '关键词' : '语义'}
                </Badge>
              )}
              <Badge
                variant={result.isPublic ? 'success' : 'warning'}
                className="text-[10px] h-5 px-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider"
              >
                {result.isPublic
                  ? <Globe className="w-3 h-3" />
                  : <Lock className="w-3 h-3" />}
                {result.isPublic ? '公开' : '私密'}
              </Badge>
            </div>
          </div>

          {/* 摘要 */}
          {result.highlight_summary
            ? (
                <MdRender noMargin className="text-sm text-muted-foreground line-clamp-5 mb-4 leading-relaxed !m-0">
                  {result.highlight_summary || ''}
                </MdRender>
              )
            : result.highlight_content
              ? (
                  <MdRender noMargin className="text-sm text-muted-foreground line-clamp-5 mb-4 leading-relaxed !m-0">
                    {result.highlight_content || ''}
                  </MdRender>
                )
              : result.summary
                ? (
                    <MdRender noMargin className="text-sm text-muted-foreground line-clamp-5 mb-4 leading-relaxed !m-0">
                      {result.summary || ''}
                    </MdRender>
                  )
                : (
                    <MdRender noMargin className="text-sm text-muted-foreground line-clamp-5 mb-4 leading-relaxed !m-0">
                      {result.content || ''}
                    </MdRender>
                  )}

          {/* 底部元信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {result.category && (
                <span className="flex items-center gap-1 text-blue-600/80 dark:text-blue-400/80">
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {result.category}
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
}

export default function SearchPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const filter = (searchParams.get('type') as FilterType) || 'all'
  const searchMode = (searchParams.get('mode') as SearchMode) || 'hybrid'
  const { data: user } = api.user.current.useQuery()

  // 回填向量 Mutation
  const backfillKeepMutation = api.keep.backfillVectors.useMutation({
    onSuccess: (data) => {
      toast.success(`笔记回填成功: 处理了 ${data.processed} 条，剩余 ${data.remaining} 条`)
    },
  })

  const backfillMomentMutation = api.moment.backfillVectors.useMutation({
    onSuccess: (data) => {
      toast.success(`动态回填成功: 处理了 ${data.processed} 条，剩余 ${data.remaining} 条`)
    },
  })

  const handleBackfill = () => {
    backfillKeepMutation.mutate()
    backfillMomentMutation.mutate()
  }

  // Keep 关键词搜索（mode=keyword 或 mode=hybrid/all+keep）
  const {
    isFetching: keepFetching,
    data: keepData = [],
    error: keepError,
    isSuccess: keepSuccess,
  } = api.keep.search.useQuery({ query }, {
    enabled: !!query && searchMode === 'keyword',
  })

  // Moment 搜索（只在关键词模式下使用）
  const {
    isFetching: momentFetching,
    data: momentData = [],
    error: momentError,
    isSuccess: momentSuccess,
  } = api.moment.search.useQuery({ query }, {
    enabled: !!query && searchMode === 'keyword',
  })

  // 语义搜索
  const {
    isFetching: keepSemanticFetching,
    data: keepSemanticData = [],
    error: keepSemanticError,
    isSuccess: keepSemanticSuccess,
  } = api.keep.semanticSearch.useQuery({ query, topK: 20 }, {
    enabled: !!query && searchMode === 'semantic',
  })

  const {
    isFetching: momentSemanticFetching,
    data: momentSemanticData = [],
    error: momentSemanticError,
    isSuccess: momentSemanticSuccess,
  } = api.moment.semanticSearch.useQuery({ query, topK: 20 }, {
    enabled: !!query && searchMode === 'semantic',
  })

  // 混合搜索
  const {
    isFetching: keepHybridFetching,
    data: keepHybridData,
    error: keepHybridError,
    isSuccess: keepHybridSuccess,
  } = api.keep.hybridSearch.useQuery({ query }, {
    enabled: !!query && searchMode === 'hybrid',
  })

  const {
    isFetching: momentHybridFetching,
    data: momentHybridData,
    error: momentHybridError,
    isSuccess: momentHybridSuccess,
  } = api.moment.hybridSearch.useQuery({ query }, {
    enabled: !!query && searchMode === 'hybrid',
  })

  const onSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
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
    router.refresh()
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
    router.refresh()
  }

  const handleModeChange = (newMode: SearchMode) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (newMode === 'hybrid') {
      newSearchParams.delete('mode')
    }
    else {
      newSearchParams.set('mode', newMode)
    }
    // 切换模式时重置类型过滤
    newSearchParams.delete('type')
    router.push(`${pathname}?${newSearchParams.toString()}`)
    router.refresh()
  }

  const isLoading = keepFetching || momentFetching || keepSemanticFetching || momentSemanticFetching || keepHybridFetching || momentHybridFetching
  const hasError = keepError || momentError || keepSemanticError || momentSemanticError || keepHybridError || momentHybridError

  // 搜索模式按钮配置
  const modeButtons: { mode: SearchMode, label: string, icon: React.ReactNode, description: string }[] = [
    { mode: 'hybrid', label: '智能搜索', icon: <Zap className="w-4 h-4" />, description: '关键词 + 语义' },
    { mode: 'semantic', label: '语义搜索', icon: <Brain className="w-4 h-4" />, description: '理解语意' },
    { mode: 'keyword', label: '关键词', icon: <Search className="w-4 h-4" />, description: '精确匹配' },
  ]

  // 关键词模式下的合并结果
  const combinedKeywordResults = React.useMemo(() => {
    if (!query || searchMode !== 'keyword')
      return []

    const keeps: UnifiedResult[] = keepData.map(item => ({
      ...item,
      _type: 'keep' as const,
      _sortTime: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt as string),
      resultId: item.id,
    }))

    const moments: UnifiedResult[] = momentData.map(item => ({
      ...item,
      _type: 'moment' as const,
      _sortTime: (item as any).updatedAt || (item as any).createdAt,
      resultId: (item as any).id,
    }))

    let results = [...keeps, ...moments]

    if (filter === 'keep') {
      results = results.filter(item => item._type === 'keep')
    }
    else if (filter === 'moment') {
      results = results.filter(item => item._type === 'moment')
    }
    return (results as UnifiedResult[]).sort(
      (a, b) => new Date(b._sortTime || 0).getTime() - new Date(a._sortTime || 0).getTime(),
    )
  }, [keepData, momentData, query, filter, searchMode])

  // 语义模式下的合并结果
  const combinedSemanticResults = React.useMemo(() => {
    if (!query || searchMode !== 'semantic')
      return []

    const keeps: UnifiedResult[] = keepSemanticData.map(item => ({
      ...item,
      _type: 'keep' as const,
    }))

    const moments: UnifiedResult[] = momentSemanticData.map(item => ({
      ...item,
      _type: 'moment' as const,
    }))

    let results = [...keeps, ...moments]
    if (filter === 'keep') {
      results = results.filter(item => item._type === 'keep')
    }
    else if (filter === 'moment') {
      results = results.filter(item => item._type === 'moment')
    }
    return results.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
  }, [keepSemanticData, momentSemanticData, query, searchMode, filter])

  // 混合模式下的合并结果
  const combinedHybridResults = React.useMemo(() => {
    if (!query || searchMode !== 'hybrid')
      return []

    const keeps: UnifiedResult[] = (keepHybridData?.results ?? []).map(item => ({
      ...item,
      _type: 'keep' as const,
    }))

    const moments: UnifiedResult[] = (momentHybridData?.results ?? []).map(item => ({
      ...item,
      _type: 'moment' as const,
    }))

    let results = [...keeps, ...moments]
    if (filter === 'keep') {
      results = results.filter(item => item._type === 'keep')
    }
    else if (filter === 'moment') {
      results = results.filter(item => item._type === 'moment')
    }

    return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }, [keepHybridData, momentHybridData, query, searchMode, filter])

  // 筛选按钮
  const filterButtons = React.useMemo(() => {
    let keepCount = 0
    let momentCount = 0

    if (searchMode === 'keyword') {
      keepCount = keepData.length
      momentCount = momentData.length
    }
    else if (searchMode === 'semantic') {
      keepCount = keepSemanticData.length
      momentCount = momentSemanticData.length
    }
    else if (searchMode === 'hybrid') {
      keepCount = (keepHybridData?.totalCount ?? 0)
      momentCount = (momentHybridData?.totalCount ?? 0)
    }

    return [
      { type: 'all' as const, label: '全部', icon: <Search className="w-4 h-4" />, count: keepCount + momentCount },
      { type: 'keep' as const, label: '笔记', icon: <FileText className="w-4 h-4" />, count: keepCount },
      { type: 'moment' as const, label: '动态', icon: <MessageSquare className="w-4 h-4" />, count: momentCount },
    ]
  }, [searchMode, keepData.length, momentData.length, keepSemanticData.length, momentSemanticData.length, keepHybridData?.totalCount, momentHybridData?.totalCount])

  const totalCount = React.useMemo(() => {
    const btn = filterButtons.find(b => b.type === filter)
    return btn?.count ?? 0
  }, [filterButtons, filter])

  return (
    <Container
      title="搜索"
      description="搜索笔记和动态内容"
      actions={
        user?.isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackfill}
            disabled={backfillKeepMutation.isPending || backfillMomentMutation.isPending}
            className="gap-2"
          >
            {backfillKeepMutation.isPending || backfillMomentMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Database className="w-4 h-4" />}
            回填向量
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* 搜索标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">搜索内容</h1>
          <p className="text-muted-foreground">快速查找你的笔记和动态，支持语义智能搜索</p>
        </div>

        {/* 搜索模式切换 */}
        <div className="flex items-center justify-center gap-2">
          {modeButtons.map(btn => (
            <Button
              key={btn.mode}
              variant={searchMode === btn.mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange(btn.mode)}
              className="gap-1.5 rounded-full"
            >
              {btn.icon}
              {btn.label}
            </Button>
          ))}
        </div>

        {/* 大型搜索框 */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-2xl mx-auto"
          onSubmit={onSearch}
        >
          <div className="relative group">
            {searchMode === 'semantic' || searchMode === 'hybrid'
              ? <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              : <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />}
            <Input
              type="text"
              name="query"
              defaultValue={query}
              placeholder={
                searchMode === 'semantic'
                  ? '用自然语言描述你要找的内容...'
                  : searchMode === 'hybrid'
                    ? '输入关键词或描述你要找的内容...'
                    : '输入关键词搜索笔记、动态...'
              }
              className="w-full h-14 pl-12 pr-32 text-lg bg-background border-2 border-border/50 rounded-2xl shadow-sm hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 h-10 px-6 rounded-xl"
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

        {/* 筛选标签 */}
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
              {keepError?.message
                || momentError?.message
                || keepSemanticError?.message
                || momentSemanticError?.message
                || keepHybridError?.message
                || momentHybridError?.message}
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
            <p className="text-muted-foreground">
              {searchMode === 'semantic' ? '正在进行语义检索...' : searchMode === 'hybrid' ? '正在智能搜索...' : '搜索中...'}
            </p>
          </motion.div>
        )}

        {/* 搜索结果 */}
        <AnimatePresence mode="wait">
          {!isLoading && query && (
            <motion.div
              key={`${filter}-${searchMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 max-w-3xl mx-auto"
            >
              {/* 结果统计 */}
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <span>
                  找到
                  {' '}
                  {totalCount}
                  {' '}
                  个结果
                </span>
                {searchMode === 'hybrid' && (
                  <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Search className="w-4 h-4" />
                      关键词
                      {' '}
                      {(filter === 'all' || filter === 'keep' ? (keepHybridData?.keywordCount ?? 0) : 0)
                        + (filter === 'all' || filter === 'moment' ? (momentHybridData?.keywordCount ?? 0) : 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      语义
                      {' '}
                      {(filter === 'all' || filter === 'keep' ? (keepHybridData?.semanticCount ?? 0) : 0)
                        + (filter === 'all' || filter === 'moment' ? (momentHybridData?.semanticCount ?? 0) : 0)}
                    </span>
                  </span>
                )}
                {searchMode === 'keyword' && totalCount > 0 && filter === 'all' && (
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

              {/* 关键词模式结果 */}
              {searchMode === 'keyword' && (
                combinedKeywordResults.length > 0
                  ? (
                      <div className="space-y-3">
                        {combinedKeywordResults.map((result, index) => (
                          <motion.div
                            key={`${result._type}-${result.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {result._type === 'keep'
                              ? (
                                  <SemanticSearchResultCard result={{
                                    ...result,
                                    title: result.title ?? undefined,
                                    summary: result.summary ?? undefined,
                                    content: result.content ?? undefined,
                                    similarity: result.similarity ?? 0,
                                  } as any}
                                  />
                                )
                              : <MomentItem moment={result} />}
                          </motion.div>
                        ))}
                      </div>
                    )
                  : (
                      !hasError && (keepSuccess || momentSuccess) && (
                        <Empty
                          title="未找到结果"
                          description={`没有找到与"${query}"相关的内容。尝试其他关键词？`}
                          className="py-12"
                        />
                      )
                    )
              )}

              {/* 语义搜索结果 */}
              {searchMode === 'semantic' && (
                combinedSemanticResults.length > 0
                  ? (
                      <div className="space-y-3">
                        {combinedSemanticResults.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {result._type === 'keep'
                              ? (
                                  <SemanticSearchResultCard result={{
                                    ...result,
                                    title: result.title ?? undefined,
                                    summary: result.summary ?? undefined,
                                    content: result.content ?? undefined,
                                    similarity: result.similarity ?? 0,
                                  } as any}
                                  />
                                )
                              : <MomentItem moment={result} />}
                          </motion.div>
                        ))}
                      </div>
                    )
                  : (
                      !hasError && (keepSemanticSuccess || momentSemanticSuccess) && (
                        <Empty
                          title="未找到语义相关结果"
                          description={`没有找到与"${query}"语义相关的内容。请尝试用不同的方式描述。`}
                          className="py-12"
                        />
                      )
                    )
              )}

              {/* 混合搜索结果 */}
              {searchMode === 'hybrid' && (
                combinedHybridResults.length > 0
                  ? (
                      <div className="space-y-3">
                        {combinedHybridResults.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {result._type === 'keep'
                              ? (
                                  <SemanticSearchResultCard result={{
                                    ...result,
                                    title: result.title ?? undefined,
                                    summary: result.summary ?? undefined,
                                    content: result.content ?? undefined,
                                    similarity: result.similarity ?? 0,
                                  } as any}
                                  />
                                )
                              : <MomentItem moment={result} />}
                          </motion.div>
                        ))}
                      </div>
                    )
                  : (
                      !hasError && (keepHybridSuccess || momentHybridSuccess) && (
                        <Empty
                          title="未找到结果"
                          description={`没有找到与"${query}"相关的内容。尝试换个说法？`}
                          className="py-12"
                        />
                      )
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
              {searchMode === 'semantic' || searchMode === 'hybrid'
                ? <Brain className="w-10 h-10 text-muted-foreground" />
                : <Search className="w-10 h-10 text-muted-foreground" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchMode === 'semantic' ? '语义搜索' : searchMode === 'hybrid' ? '智能搜索' : '关键词搜索'}
            </h3>
            <p className="text-muted-foreground max-w-sm">
              {searchMode === 'semantic'
                ? '使用 AI 语义理解，用自然语言描述你想查找的内容'
                : searchMode === 'hybrid'
                  ? '结合关键词匹配和 AI 语义理解，获得最全面的搜索结果'
                  : '输入关键词搜索你的笔记和动态内容，支持标题、正文内容搜索'}
            </p>
          </motion.div>
        )}
      </div>
    </Container>
  )
}
