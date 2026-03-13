# Keep 分页展示功能设计文档

**日期**: 2026-03-13
**主题**: Keep 页面分页展示功能实现

---

## 1. 设计目标

为 Keep 页面添加分页展示功能，同时保留原有无限滚动作为替代视图。

## 2. 路由结构

| 路由 | 说明 | 优先级 |
|------|------|--------|
| `/keep` | 分页展示（新主页），支持分类筛选 + 页码跳转 | 主要视图 |
| `/keep/feed` | 无限滚动（保留原功能），支持分类筛选 | 替代视图 |
| `/keep/[id]` | 笔记详情 | 不变 |
| `/keep/save` | 创建/编辑笔记 | 不变 |

## 3. 后端接口设计

### 3.1 新增 tRPC Query: `keep.fetchByPage`

**输入参数**:
```typescript
{
  page?: number        // 当前页码，默认 1
  pageSize?: number    // 每页条数，默认 10
  category?: string    // 分类筛选（可选）
}
```

**返回数据**:
```typescript
{
  items: KeepWithIncludes[]  // 当前页数据
  total: number              // 总条数
  totalPages: number         // 总页数
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
```

### 3.2 Service 层新增方法

在 `keep.service.ts` 中添加:

```typescript
async function findAccessiblePage(
  query: { page: number; pageSize: number; category?: string },
  userIds: string[]
): Promise<{
  items: KeepWithIncludes[]
  total: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}>
```

**实现要点**:
- 使用 Prisma 的 `skip`/`take` 实现 offset 分页
- 使用 `db.keep.count()` 获取总数计算总页数
- 复用现有的访问权限逻辑（公开或本人）
- 按 `createdAt` 降序排列

## 4. 前端组件设计

### 4.1 提取共享组件: `KeepCard`

将 `list.tsx` 中的 `KeepCard` 组件提取到独立的共享组件文件中。

位置: `src/app/(full-layout)/keep/components/keep-card.tsx`

### 4.2 新增分页列表: `PaginationList`

位置: `src/app/(full-layout)/keep/components/pagination-list.tsx`

**职责**:
- 使用 tRPC 的 `useQuery` 获取分页数据
- 管理当前页码状态
- 渲染笔记卡片网格

### 4.3 新增分页器: `Pagination`

位置: `src/components/ui/pagination.tsx`

**功能**:
- 显示页码按钮（最多显示 5 个连续页码）
- 上一页/下一页按钮
- 首页/末页快速跳转
- 跳转到指定页输入框
- 显示当前页码/总页数

**样式**:
- 使用项目现有的 UI 组件风格（Button、Input）
- 响应式适配移动端

### 4.4 新增视图切换: `ViewToggle`

位置: `src/app/(full-layout)/keep/components/view-toggle.tsx`

**功能**:
- 在分页视图和无限滚动视图间切换
- 显示当前激活的视图
- 使用图标按钮展示（📄 分页 / 🔄 流式）

## 5. 页面实现

### 5.1 新主页: `/keep` (分页)

保留现有 `page.tsx`，但将 `KeepList` 替换为 `PaginationList`。

修改内容:
- 预取第一页数据
- 添加 `ViewToggle` 组件
- 保持分类筛选功能

### 5.2 无限滚动页: `/keep/feed`

新建路由文件: `src/app/(full-layout)/keep/feed/page.tsx`

内容基于原 `page.tsx`，保留 `KeepList` 组件。

## 6. 数据流设计

### 分页视图数据流
```
用户操作（点击页码/输入页码）
  ↓
更新 URL query params (?page=2)
  ↓
PaginationList 检测到 page 变化
  ↓
tRPC useQuery 重新获取数据
  ↓
更新 UI 展示新页数据
```

### URL 状态同步
- 页码通过 URL query parameter `?page=2` 持久化
- 刷新页面后保持当前页
- 分类筛选通过 `?category=xxx` 传递

## 7. 错误处理

- **数据加载失败**: 显示错误提示，提供重试按钮
- **页码超出范围**: 自动跳转到第一页或最后一页
- **空数据**: 显示 `Empty` 组件

## 8. 性能优化

- 使用 tRPC 的 `staleTime` 避免重复请求
- 预取相邻页面数据（可选优化）
- 组件懒加载（如分页器较大时）

## 9. 文件变更清单

### 新增文件
- `src/app/(full-layout)/keep/components/keep-card.tsx` - 卡片组件提取
- `src/app/(full-layout)/keep/components/pagination-list.tsx` - 分页列表
- `src/app/(full-layout)/keep/components/view-toggle.tsx` - 视图切换
- `src/app/(full-layout)/keep/feed/page.tsx` - 无限滚动视图页面
- `src/components/ui/pagination.tsx` - 通用分页组件

### 修改文件
- `src/server/api/routers/keep.ts` - 添加 fetchByPage query
- `src/service/keep.service.ts` - 添加 findAccessiblePage 方法
- `src/app/(full-layout)/keep/page.tsx` - 切换为分页视图
- `src/app/(full-layout)/keep/components/list.tsx` - 提取 KeepCard
- `src/dto/keep.dto.ts` - 添加分页查询 DTO（如需要）

## 10. 测试要点

- [ ] 分页查询接口返回正确数据
- [ ] 页码跳转功能正常
- [ ] 分类筛选在分页视图正常工作
- [ ] 无限滚动视图功能未受影响
- [ ] 视图切换导航正常工作
- [ ] 空数据状态显示正确
- [ ] 移动端分页器适配正常

---

## 附录: 参考实现

### 分页器组件伪代码

```tsx
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 计算显示的页码范围
  const pageNumbers = calculatePageRange(currentPage, totalPages)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        上一页
      </Button>

      {/* 页码按钮 */}
      {pageNumbers.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        下一页
      </Button>

      {/* 跳转输入框 */}
      <div className="flex items-center gap-2">
        <span>跳至</span>
        <Input
          type="number"
          className="w-16"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = parseInt(e.currentTarget.value)
              if (page >= 1 && page <= totalPages) {
                onPageChange(page)
              }
            }
          }}
        />
        <span>页</span>
      </div>
    </div>
  )
}
```
