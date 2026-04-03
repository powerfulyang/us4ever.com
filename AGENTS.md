# AGENTS.md

本文件为 Codex 和其他 AI 编码助手提供项目上下文指引。

## 项目概览

**us4ever.com** 是一个现代化的个人工具集合应用，基于 Next.js 16 (App Router) 构建。集成笔记本、思维导图、待办事项、动态分享、图片管理等核心功能模块。

项目采用企业级架构设计，追求极致的类型安全和开发体验。使用双 API 架构（tRPC + Hono），充分发挥两种框架的优势。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js | 16.2.2 |
| UI 框架 | React | 19.2.4 |
| 类型系统 | TypeScript | 6.x (strict) |
| 主 API | tRPC | 11.16.0 |
| 辅助 API | Hono | 4.12.9 |
| 数据库 ORM | Prisma | 7.6.0 |
| 数据库 | PostgreSQL | 14+ (pgvector) |
| 客户端状态 | Zustand | 5.0.12 |
| 服务端状态 | React Query | 5.96.0 |
| 样式框架 | Tailwind CSS | 4.2.2 |
| 动画库 | Framer Motion | 12.38.0 |
| UI 组件基础 | Radix UI | 各组件独立版本 |
| AI 服务 | Google Gemini | @google/generative-ai |
| 日志系统 | Pino | 10.3.1 |
| 测试框架 | Vitest | 4.1.2 |
| 包管理器 | pnpm | - |

## 常用命令

```bash
# 开发 (端口 12345)
pnpm dev

# 构建与启动
pnpm build              # 生产构建
pnpm start              # 启动生产服务器 (自动执行 db:migrate && db:seed)
pnpm preview            # 本地构建并预览

# 数据库操作
pnpm db:migrate:dev     # 开发迁移 (交互式命名)
pnpm db:migrate         # 生产迁移部署
pnpm db:push            # 快速推送 schema (无迁移文件)
pnpm db:studio          # 打开 Prisma Studio
pnpm db:seed            # 执行种子脚本

# 代码质量
pnpm lint               # ESLint 检查并自动修复
pnpm lint:fix           # 仅修复 src 目录
pnpm type-check         # TypeScript 类型检查 (tsc --noEmit)

# Git Hooks
# pre-commit: 自动运行 lint-staged (eslint --fix)
```

## 架构说明

### 双 API 架构详解

项目同时使用两种 API 框架，各有分工：

#### 1. tRPC (`src/server/api/`)

**主 API，负责所有 CRUD 操作**

- **端到端类型安全**: 前后端共享类型定义
- **三级权限控制**:
  - `publicProcedure` - 公开接口
  - `protectedProcedure` - 需登录
  - `adminProcedure` - 需管理员权限
- **路由列表**:
  - `admin` - 用户管理、系统配置
  - `asset` - 资产/文件管理
  - `keep` - 笔记 CRUD + 向量搜索
  - `mindMap` - 思维导图
  - `moment` - 动态/瞬间
  - `tag` - 标签管理
  - `todo` - 待办事项
  - `user` - 用户信息
- **入口文件**: `src/server/api/root.ts`
- **处理器**: `src/app/api/trpc/[trpc]/route.ts`

#### 2. Hono (`src/server/hono/`)

**辅助 API，处理特殊路由**

- **轻量高性能**: 边缘计算友好
- **路由列表**:
  - `/api/lp` - Landing Page 相关
  - `/api/tts` - 文本转语音 (edge-tts)
  - `/api/sync/telegram` - Telegram 消息同步 (需认证)
  - `/api/internal` - 内部调用接口
- **入口文件**: `src/server/hono/index.ts`
- **挂载点**: `/api` (basePath)

### 认证机制

- **JWT Cookie 认证**
- Cookie 名称: `authorization`
- JWT 算法: HS256
- 用户信息提取: 通过中间件自动注入 `ctx.user`

### Request ID 追踪

使用 AsyncLocalStorage 在异步上下文中追踪请求 ID:

- **tRPC**: `requestIdMiddleware` 中间件
- **Hono**: `hono/request-id` 官方中间件
- **日志关联**: 所有日志自动携带 requestId

### 数据库 Schema 核心模型

| 模型 | 用途 | 关键字段 |
|------|------|----------|
| `User` | 用户 | email, nickname, isAdmin, groupId |
| `Group` | 用户组 | name, users[] |
| `Keep` | 笔记 | title, content, summary, *_vector (向量) |
| `Todo` | 待办 | title, status, priority, dueDate |
| `MindMap` | 思维导图 | title, content (JSON), summary |
| `Moment` | 动态 | content, *_vector, images[], videos[] |
| `Image` | 图片 | hash, description_vector, exif, thumbnails |
| `Video` | 视频 | name, duration, poster, file |
| `File` | 文件 | hash, size, path, bucketId |
| `Bucket` | 存储桶 | provider (R2/COS/ORACLE), accessKey, secretKey |
| `PushSubscription` | Web Push | endpoint, p256dh, auth |

### 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── (full-layout)/          # 带完整布局的页面
│   │   ├── keep/               # 笔记模块
│   │   ├── todo/               # 待办模块
│   │   ├── mindmap/            # 思维导图
│   │   ├── moment/             # 动态/瞬间
│   │   ├── image/              # 图片管理
│   │   ├── tag/                # 标签聚合
│   │   ├── search/             # 全局搜索
│   │   ├── profile/            # 用户资料
│   │   ├── admin/              # 管理面板
│   │   ├── push/               # 推送设置
│   │   ├── demo/               # 演示页面
│   │   └── page.tsx            # 首页 (Resource Hub)
│   ├── (no-layout)/            # 无布局的全屏页面
│   │   ├── mindmap/[id]/       # 全屏思维导图编辑
│   │   └── demo/               # 演示子页面
│   ├── api/                    # API 路由处理器
│   │   ├── trpc/[trpc]/        # tRPC 处理
│   │   ├── upload/             # 上传接口
│   │   └── [[...route]]/       # Hono 挂载点
│   ├── layout.tsx              # 根布局
│   └── global-error.tsx        # 全局错误边界
│
├── components/
│   ├── ui/                     # 基础 UI 组件 (Radix UI)
│   ├── layout/                 # 布局组件
│   ├── hoc/                    # 高阶组件
│   ├── auth/                   # 认证相关
│   ├── md-render/              # Markdown 渲染
│   ├── user/                   # 用户相关
│   ├── pwa/                    # PWA/推送
│   ├── waline/                 # 评论系统
│   └── theme-*.tsx             # 主题切换
│
├── server/
│   ├── api/                    # tRPC 配置和路由
│   │   ├── trpc.ts             # 中间件和 procedure 定义
│   │   ├── root.ts             # 路由合并
│   │   └── routers/            # 各业务路由
│   ├── hono/                   # Hono 路由
│   │   ├── index.ts            # 应用实例
│   │   ├── routes/             # 各路由模块
│   │   └── middleware/         # 中间件
│   ├── db.ts                   # Prisma 客户端单例
│   └── logger.ts               # Pino 日志配置
│
├── service/                    # 业务逻辑服务层
│   ├── keep/                   # Keep 服务 (核心/查询/搜索/向量)
│   ├── moment/                 # Moment 服务
│   ├── todo.service.ts         # Todo 服务
│   ├── mindmap.service.ts      # MindMap 服务
│   ├── user.service.ts         # User 服务
│   ├── tag.service.ts          # Tag 服务
│   ├── asset.service.ts        # Asset 服务
│   ├── upload.service.ts       # Upload 服务
│   ├── s3.service.ts           # S3/多云存储
│   ├── vector-search.service.ts # 向量搜索
│   └── embedding.service.ts    # AI Embedding
│
├── hooks/                      # 自定义 React Hooks
│   ├── use-loading.ts          # 加载状态管理
│   ├── use-error-handler.ts    # 错误处理
│   └── use-image-upload.ts     # 图片上传
│
├── store/                      # Zustand 状态管理
│   ├── user.ts                 # 用户状态
│   └── mind-map-note.ts        # 思维导图编辑状态
│
├── lib/                        # 核心工具库
│   ├── error-handler.ts        # 统一错误处理系统
│   ├── telegram.ts             # Telegram API (RxJS)
│   ├── ffmpeg.ts               # FFmpeg 视频处理
│   ├── fetch.ts                # 增强的 fetch
│   ├── xmind.ts                # XMind 解析
│   └── constants.ts            # 常量定义
│
├── trpc/                       # tRPC 客户端配置
│   ├── react.tsx               # React 客户端 Provider
│   ├── server.ts               # 服务端 caller
│   ├── query-client.ts         # React Query 配置
│   └── errorToastLink.ts       # 错误 Toast 链
│
├── types/                      # TypeScript 类型定义
│   ├── common.ts               # 通用类型
│   ├── push.ts                 # Push 类型
│   ├── amap.ts                 # 高德地图类型
│   └── declarations/           # 第三方库类型补充
│
├── dto/                        # 数据传输对象
│   ├── base.dto.ts             # 基础 DTO
│   ├── keep.dto.ts             # Keep DTO
│   ├── moment.dto.ts           # Moment DTO
│   └── todo.dto.ts             # Todo DTO
│
├── utils/                      # 工具函数
│   ├── cn.ts                   # Tailwind 类名合并
│   ├── request-id.ts           # Request ID 生成
│   └── redact.ts               # 敏感信息脱敏
│
├── constants/                  # 业务常量
│   └── moment.ts               # Moment 分类映射
│
├── actions/                    # Server Actions
│   ├── index.ts                # 通用 actions
│   └ web-push.ts               # Web Push actions
│
└── env.js                      # 环境变量验证 (@t3-oss/env-nextjs)
```

## 关键文件速查

| 文件 | 用途 |
|------|------|
| `src/env.js` | 环境变量验证和类型定义 |
| `src/server/api/trpc.ts` | tRPC 中间件和 procedure 定义 |
| `src/server/api/root.ts` | tRPC 路由合并和导出 |
| `src/server/hono/index.ts` | Hono 应用实例和路由挂载 |
| `src/server/db.ts` | Prisma 客户端单例模式 |
| `src/server/logger.ts` | Pino 结构化日志配置 |
| `src/lib/error-handler.ts` | 统一错误处理系统 |
| `src/utils/cn.ts` | Tailwind 类名合并工具 |
| `prisma/schema.prisma` | 数据库模型定义 |
| `next.config.js` | Next.js 配置 (Turbopack, Sentry, 安全头部) |
| `eslint.config.js` | ESLint 配置 (@antfu/eslint-config) |
| `vitest.config.mts` | Vitest 测试配置 |

## 代码风格指南

### 组件开发规范

```tsx
// 函数式组件 + TypeScript
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

### CSS 条件类名 - 使用对象语法

```tsx
import { cn } from '@/utils/cn'

// 推荐 ✅
<div className={cn(
  'text-sm',
  {
    'text-blue-500': isActive,
    'text-gray-500': !isActive,
    'opacity-50': isDisabled
  }
)} />

// 避免 ❌
<div className={cn('text-sm', isActive ? 'text-blue-500' : 'text-gray-500')} />
```

### 动画处理

- **复杂动画**: 使用 Framer Motion
- **简单过渡**: 使用 Tailwind CSS 动画类 (`transition-*`, `animate-*`)

### SSR 注意事项

```tsx
export function Component() {
  useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
      // 浏览器 API 操作
    }
  }, [])
}
```

### 错误处理模式

```tsx
import { createError, transformError, logError } from '@/lib/error-handler'

// 创建标准错误
throw createError.notFound('Resource not found')

// 转换未知错误
const appError = transformError(unknownError)

// 日志记录
logError(appError, { context: 'additional info' })
```

## 环境变量说明

定义于 `src/env.js`，使用 `@t3-oss/env-nextjs` 进行验证：

### 服务端变量

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `NODE_ENV` | 否 | 'development' | 运行环境 |
| `DATABASE_URL` | 是 | - | PostgreSQL 连接字符串 |
| `JWT_SECRET` | 否 | hostname | JWT 签名密钥 |
| `VAPID_PRIVATE_KEY` | 是 | - | Web Push 私钥 |
| `GEMINI_API_KEY` | 否 | - | Gemini AI API 密钥 |
| `AMAP_KEY` | 否 | - | 高德地图 API 密钥 |
| `TELEGRAM_API_ENDPOINT` | 否 | 'http://api.telegram:8000' | Telegram API 端点 |
| `LOG_LEVEL` | 否 | 'info' | 日志级别 (trace/debug/info/warn/error/fatal) |

### 客户端变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push 公钥 |

### 构建时跳过验证

```bash
SKIP_ENV_VALIDATION=true pnpm build  # Docker 构建时使用
```

## 特殊功能

### 向量搜索 (pgvector)

- PostgreSQL pgvector 扩展
- 向量维度: 3072
- 支持 Keep、Moment、Image 的语义搜索
- 使用 Gemini API 生成 Embedding

### 多存储提供商

支持同时配置多个 S3 兼容存储：

- **Cloudflare R2** (Provider.R2)
- **腾讯云 COS** (Provider.TENCENT_COS)
- **Oracle OSS** (Provider.ORACLE_OSS)

### Telegram 同步

- RxJS 流处理实现消息批处理和去重
- 支持多频道同步
- 位置: `src/lib/telegram.ts`

### Turbopack 自定义 Loader

- Loader: `loaders/inject-path-loader.mjs`
- 功能: 注入仓库路径到源文件（便于代码溯源）

## 测试配置

- **框架**: Vitest + jsdom + @testing-library/react
- **Setup**: `src/test/setup.ts`
- **覆盖率阈值**: 80%
- **当前测试**: `tests/telegram/post.e2e.test.ts`

## Git Hooks

配置于 `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": "npm run pre-commit"
  },
  "lint-staged": {
    "*": "eslint --fix"
  }
}
```

---

> 本文件专为 AI 编码助手设计，提供项目核心上下文信息。