git add src/app/(full-layout)/keep/components/list.tsx
git commit -m "refactor(keep): extract KeepCard component for reuse"
```

---

## Chunk 3: 通用分页组件

### Task 3.1: 创建 Pagination 组件

**Files:**
- Create: `src/components/ui/pagination.tsx`

**Context:**
创建通用分页组件，支持页码按钮、上一页/下一页、首页/末页、跳转到指定页输入框。

**依赖:** 无

- [ ] **Step 1: 创建 pagination.tsx**

创建 `src/components/ui/pagination.tsx`：

```typescript
'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = React.useState('')

  // 计算显示的页码范围（最多显示5个页码）
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleJump = () => {
    const page = parseInt(jumpPage, 10)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpPage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump()
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* 统计信息 */}
      <div className="text-sm text-muted-foreground">
        共 {total} 条，每页 {pageSize} 条，共 {totalPages} 页
      </div>

      {/* 分页控制 */}
      <div className="flex items-center gap-1">
        {/* 首页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          title="首页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 上一页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 页码按钮 */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className="h-8 min-w-[32px] px-2"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* 下一页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 末页 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="末页"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        {/* 跳转输入框 */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">跳至</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-16 text-center"
            placeholder="页"
          />
          <span className="text-sm text-muted-foreground">页</span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleJump}
            disabled={!jumpPage || parseInt(jumpPage, 10) < 1 || parseInt(jumpPage, 10) > totalPages}
          >
            跳转
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 类型检查**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/pagination.tsx
git commit -m "feat(ui): add Pagination component with jump input"
```

---

## Chunk 4: 前端分页列表实现

### Task 4.1: 创建 PaginationList 组件

**Files:**
- Create: `src/app/(full-layout)/keep/components/pagination-list.tsx`

**Context:**
创建分页列表组件，使用 `fetchByPage` tRPC 接口，支持分类筛选。

**依赖:** Task 2.1 (KeepCard), Task 3.1 (Pagination), Task 1.3 (后端接口)

- [ ] **Step 1: 创建 pagination-list.tsx**

创建 `src/app/(full-layout)/keep/components/pagination-list.tsx`：

```typescript
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { KeepCard } from '@/app/(full-layout)/keep/components/keep-card'
import { Empty } from '@/components/layout/Empty'
import { Pagination } from '@/components/ui/pagination'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { api } from '@/trpc/react'

interface PaginationListProps {
  category?: string
  page?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE = 10

export function PaginationList({ category, page = 1, onPageChange }: PaginationListProps) {
  const [currentPage, setCurrentPage] = React.useState(page)

  // 当外部 page 变化时同步
  React.useEffect(() => {
    setCurrentPage(page)
  }, [page])

  const { data, isLoading, error } = api.keep.fetchByPage.useQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    category,
  }, {
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="正在获取笔记..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">加载失败：{error.message}</p>
        <button
          onClick={() => handlePageChange(currentPage)}
          className="text-primary hover:underline"
        >
          重试
        </button>
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return <Empty title="暂无笔记" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {data.items.map((keep) => (
            <motion.div
              key={keep.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <KeepCard
                keep={keep}
                onDelete={() => handlePageChange(currentPage)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Pagination
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 类型检查**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(full-layout)/keep/components/pagination-list.tsx
git commit -m "feat(keep): add PaginationList component"
```

---

## Chunk 5: 视图切换与页面实现

### Task 5.1: 创建视图切换组件

**Files:**
- Create: `src/app/(full-layout)/keep/components/view-toggle.tsx`

**Context:**
创建视图切换组件，用于在分页视图和无限滚动视图间切换。

**依赖:** 无

- [ ] **Step 1: 创建 view-toggle.tsx**

创建 `src/app/(full-layout)/keep/components/view-toggle.tsx`：

```typescript
'use client'

import { LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface ViewToggleProps {
  category?: string
}

export function ViewToggle({ category }: ViewToggleProps) {
  const pathname = usePathname()
  const isFeed = pathname === '/keep/feed'

  const basePath = '/keep'
  const feedPath = '/keep/feed'

  // 构建带分类参数的链接
  const getHref = (path: string) => {
    if (category) {
      return `${path}?category=${encodeURIComponent(category)}`
    }
    return path
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Link href={getHref(basePath)}>
        <Button
          variant={!isFeed ? 'secondary' : 'ghost'}
          size="sm"
          className={cn(
            'gap-1.5 h-7',
            !isFeed && 'bg-background shadow-sm'
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">分页</span>
        </Button>
      </Link>
      <Link href={getHref(feedPath)}>
        <Button
          variant={isFeed ? 'secondary' : 'ghost'}
          size="sm"
          className={cn(
            'gap-1.5 h-7',
            isFeed && 'bg-background shadow-sm'
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">流式</span>
        </Button>
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 类型检查**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(full-layout)/keep/components/view-toggle.tsx
git commit -m "feat(keep): add ViewToggle component"
```

---

### Task 5.2: 修改 /keep 页面为分页视图

**Files:**
- Modify: `src/app/(full-layout)/keep/page.tsx`

**Context:**
将原无限滚动视图改为分页视图，添加视图切换按钮。

**依赖:** Task 4.1 (PaginationList), Task 5.1 (ViewToggle)

- [ ] **Step 1: 修改 page.tsx**

更新 `src/app/(full-layout)/keep/page.tsx`：

```typescript
import type { Metadata } from 'next'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { PaginationList } from '@/app/(full-layout)/keep/components/pagination-list'
import { ViewToggle } from '@/app/(full-layout)/keep/components/view-toggle'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '笔记本',
  description: '记录灵感与思考的地方',
  alternates: {
    canonical: `/keep`,
  },
}

export default async function KeepPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category, page: pageParam } = await searchParams
  const page = pageParam ? parseInt(pageParam, 10) : 1

  // 预取第一页数据
  await api.keep.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: 10,
    category,
  })

  return (
    <HydrateClient>
      <Container
        title="笔记本"
        description="记录灵感与思考的地方"
        actions={(
          <AuthenticatedOnly disableChildren>
            <div className="flex items-center gap-2">
              <ViewToggle category={category} />
              <Link href="/search">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/keep/save">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  创建笔记
                </Button>
              </Link>
            </div>
          </AuthenticatedOnly>
        )}
      >
        <KeepCategoryServer currentCategory={category} />
        <PaginationList category={category} page={Math.max(1, page)} />
      </Container>
    </HydrateClient>
  )
}
```

- [ ] **Step 2: TypeScript 类型检查**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(full-layout)/keep/page.tsx
git commit -m "feat(keep): switch main page to pagination view"
```

---

### Task 5.3: 创建 /keep/feed 无限滚动页面

**Files:**
- Create: `src/app/(full-layout)/keep/feed/page.tsx`

**Context:**
创建独立的无限滚动视图页面，保留原有功能。

**依赖:** Task 2.1 (KeepCard 提取后的 list.tsx)

- [ ] **Step 1: 创建 feed/page.tsx**

创建 `src/app/(full-layout)/keep/feed/page.tsx`：

```typescript
import type { Metadata } from 'next'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { KeepList } from '@/app/(full-layout)/keep/components/list'
import { ViewToggle } from '@/app/(full-layout)/keep/components/view-toggle'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '笔记本',
  description: '记录灵感与思考的地方',
  alternates: {
    canonical: `/keep/feed`,
  },
}

export default async function KeepFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  // 预取第一页数据（用于无限滚动）
  await api.keep.fetchByCursor.prefetch({ category })

  return (
    <HydrateClient>
      <Container
        title="笔记本"
        description="记录灵感与思考的地方"
        actions={(
          <AuthenticatedOnly disableChildren>
            <div className="flex items-center gap-2">
              <ViewToggle category={category} />
              <Link href="/search">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/keep/save">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  创建笔记
                </Button>
              </Link>
            </div>
          </AuthenticatedOnly>
        )}
      >
        <KeepCategoryServer currentCategory={category} />
        <KeepList category={category} />
      </Container>
    </HydrateClient>
  )
}
```

- [ ] **Step 2: TypeScript 类型检查**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(full-layout)/keep/feed/page.tsx
git commit -m "feat(keep): create feed page with infinite scroll"
```

---

## Chunk 6: 最终验证

### Task 6.1: 完整类型检查

**Files:** 所有修改的文件

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
pnpm typecheck
```

Expected: PASS（无类型错误）

- [ ] **Step 2: 运行 ESLint**

```bash
pnpm lint
```

Expected: PASS（无 lint 错误）

- [ ] **Step 3: 最终提交**

```bash
git log --oneline -10
```

Expected: 显示所有 commit 已提交

---

## 依赖关系图

```
Task 1.1 (DTO) ───┐
                  │
Task 1.2 (Service) ─┼──> Task 1.3 (Router) ──> Task 4.1 (PaginationList) ──> Task 5.2 (/keep page)
                  │                                     │
Task 2.1 (KeepCard) ────────────────────────────────────┼──> Task 5.1 (ViewToggle) ──> Task 5.3 (/keep/feed)
                  │                                     │
Task 3.1 (Pagination) ──────────────────────────────────┘
```

**执行顺序建议：**
1. Chunk 1 (Task 1.1 -> 1.2 -> 1.3) - 后端接口
2. Chunk 2 (Task 2.1) - 提取共享组件
3. Chunk 3 (Task 3.1) - 分页组件
4. Chunk 4 (Task 4.1) - 分页列表
5. Chunk 5 (Task 5.1 -> 5.2 -> 5.3) - 视图切换与页面
6. Chunk 6 (Task 6.1) - 最终验证
