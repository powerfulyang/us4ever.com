# 🚀 个人工具集合应用

这是一个基于 Next.js 15 构建的现代化个人工具集合应用，采用最佳实践和企业级架构设计。

## ✨ 功能模块

- **📝 笔记本**：支持 Markdown 格式的笔记管理，具备富文本编辑和实时预览
- **🧠 思维导图**：基于 simple-mind-map 的交互式思维导图工具
- **✅ 待办事项**：智能的 Todo 管理系统，支持优先级和分类
- **🛠️ 工具集**：包含图片转 Base64、文件处理等实用工具

## 🏗️ 技术栈

### 核心框架

- **Next.js 15** (App Router) - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript

### 状态管理与数据

- **tRPC 11** - 端到端类型安全的 API
- **Prisma** - 现代化数据库 ORM
- **PostgreSQL** - 关系型数据库
- **Zustand** - 轻量级状态管理
- **React Query** - 服务端状态管理

### 样式与 UI

- **Tailwind CSS** - 原子化 CSS 框架
- **Framer Motion** - 动画库
- **Lucide React** - 图标库
- **自定义 UI 组件库** - 统一的设计系统

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试框架
- **pnpm** - 高效的包管理器

## 📁 项目架构

```
src/
├── app/                    # Next.js App Router 页面
├── components/             # React 组件
│   ├── ui/                # 基础 UI 组件库
│   ├── hoc/               # 高阶组件
│   └── layout/            # 布局组件
├── hooks/                 # 自定义 React Hooks
├── lib/                   # 核心库和工具
│   ├── error-handler.ts   # 统一错误处理
│   ├── performance.ts     # 性能优化工具
│   ├── security.ts        # 安全工具
│   └── test-utils.ts      # 测试工具
├── server/                # 服务端代码
│   ├── api/               # tRPC 路由
│   └── db.ts              # 数据库配置
├── store/                 # 状态管理
├── utils/                 # 工具函数
├── types/                 # TypeScript 类型定义
└── test/                  # 测试配置
```

## 🎯 重构亮点

### 1. 错误处理系统

- ✅ 统一的错误类型和处理机制
- ✅ 自动错误日志记录
- ✅ 用户友好的错误信息
- ✅ 重试机制和断路器模式

### 2. 性能优化

- ✅ 内存缓存和 LRU 缓存
- ✅ 防抖和节流函数
- ✅ 批处理和资源池
- ✅ 性能监控和测量

### 3. 安全增强

- ✅ 输入验证和清理
- ✅ XSS 和 CSRF 防护
- ✅ 速率限制
- ✅ 安全头部配置

### 4. 组件架构

- ✅ 高阶组件模式
- ✅ 错误边界处理
- ✅ 加载状态管理
- ✅ 统一的设计系统

### 5. 状态管理

- ✅ 类型安全的状态管理
- ✅ 持久化和订阅机制
- ✅ 异步操作处理
- ✅ 调试和开发工具

### 6. 测试框架

- ✅ 完整的测试环境配置
- ✅ 组件测试最佳实践
- ✅ Mock 工具和测试数据生成
- ✅ 覆盖率报告和质量门禁

## 🚀 开发指南

### 环境要求

- **Node.js** 18+ LTS
- **pnpm** 8+
- **PostgreSQL** 14+

### 快速开始

```bash
# 1. 克隆仓库
git clone <repository-url>
cd api.us4ever

# 2. 安装依赖
pnpm install

# 3. 环境配置
cp .env.example .env.local
# 编辑 .env.local 配置数据库连接等参数

# 4. 数据库设置
pnpm db:generate  # 生成 Prisma 客户端
pnpm db:migrate   # 运行数据库迁移
pnpm db:seed      # 填充测试数据

# 5. 启动开发服务器
pnpm dev
```

应用将在 http://localhost:12345 运行。

### 📜 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm dev:turbopack    # 使用 Turbopack 启动开发服务器

# 构建
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
pnpm preview          # 构建并预览

# 数据库
pnpm db:generate      # 生成 Prisma 客户端
pnpm db:migrate       # 运行数据库迁移
pnpm db:seed          # 填充测试数据
pnpm db:studio        # 打开 Prisma Studio
pnpm db:push          # 推送 schema 到数据库

# 代码质量
pnpm lint             # 运行 ESLint
pnpm lint:fix         # 修复 ESLint 错误
pnpm typecheck        # TypeScript 类型检查

# 测试
pnpm test             # 运行测试
pnpm test:watch       # 监听模式运行测试
pnpm test:coverage    # 运行测试并生成覆盖率报告
```

### 🏗️ 开发最佳实践

#### 组件开发

```tsx
// 使用函数式组件和 TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`, `btn-${size}`)}>
      {children}
    </button>
  )
}
```

#### 状态管理

```tsx
// 使用增强的 Zustand store
const useFeatureStore = createStore<FeatureState>(
  (set, get) => ({
    data: null,
    fetchData: async () => {
      // 异步操作会自动处理加载状态
    },
  }),
  {
    name: 'feature-store',
    persist: { key: 'feature-data' },
  }
)
```

#### API 调用

```tsx
// 使用统一的 API hooks
function FeatureComponent() {
  const { data, isLoading, error } = useApiQuery(
    ['feature', 'list'],
    () => api.feature.list.query(),
    { staleTime: 5 * 60 * 1000 }
  )

  if (isLoading)
    return <Loading />
  if (error)
    return <ErrorMessage error={error} />

  return <FeatureList data={data} />
}
```

#### 错误处理

```tsx
// 使用错误边界包装组件
export default withErrorBoundary(FeatureComponent, {
  fallback: ({ error, retry }) => (
    <ErrorFallback error={error} onRetry={retry} />
  ),
})
```

### 🧪 测试指南

#### 组件测试

```tsx
describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### API 测试

```tsx
describe('API Endpoints', () => {
  it('creates a new item', async () => {
    const mockData = TestDataGenerator.createKeep()
    const result = await api.keep.create.mutate(mockData)

    expect(result).toMatchObject(mockData)
  })
})
```

### 📦 部署

#### 生产环境部署

```bash
# 1. 构建应用
pnpm build

# 2. 运行数据库迁移
pnpm db:migrate

# 3. 启动生产服务器
pnpm start
```

#### Docker 部署

```bash
# 构建镜像
docker build -t api-us4ever .

# 运行容器
docker run -p 3000:3000 api-us4ever
```

### 🔧 配置说明

#### 环境变量

```env
# 数据库
DATABASE_URL="postgresql://..."

# JWT 密钥
JWT_SECRET="your-secret-key"

# 外部服务
GEMINI_API_KEY="your-gemini-key"
DEEPSEEK_API_KEY="your-deepseek-key"
```

#### TypeScript 配置

项目使用严格的 TypeScript 配置，包括：

- `strict: true` - 启用所有严格检查
- `noUncheckedIndexedAccess: true` - 防止未检查的索引访问
- 路径别名 `@/*` 指向 `src/*`

### 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 代码规范

### 组件开发规范

- 优先使用函数式组件和 Hooks
- 组件文件使用 .tsx 扩展名
- 组件名使用 PascalCase
- Props 接口使用 ComponentNameProps 命名

### CSS 条件渲染

使用 `cn` 工具函数进行条件类名渲染：

```tsx
import { cn } from '@/utils/cn'

// 推荐写法
<div className={cn(
  'text-sm',
  {
    'text-blue-500': isActive,
    'text-gray-500': !isActive,
    'opacity-50': isDisabled
  }
)}
>
</div>
```

### 动画处理

- 优先使用 framer-motion 库实现复杂动画
- 简单过渡效果使用 Tailwind CSS 的动画类

### SSR 注意事项

由于项目使用 Next.js 的 SSR 功能，在使用浏览器 API时需要注意：

```tsx
export function Component() {
  useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
      // 执行浏览器 API
    }
  }, [])
}
```

## 贡献指南

1. Fork 该仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
