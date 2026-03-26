# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 **Next.js 15** (App Router) 构建的个人工具集合应用，包含笔记本、思维导图、待办事项、动态/瞬间等模块。

## Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.x, SCSS/CSS Modules, Framer Motion
- **State Management**: Zustand (client), React Query + tRPC (server)
- **Database**: PostgreSQL + Prisma ORM 7.x
- **API**: tRPC 11 (端到端类型安全), Hono (轻量级服务端框架)
- **Package Manager**: pnpm
- **AI**: Google Gemini API
- **Logging**: Pino (结构化日志)

## Common Commands

```bash
# Development (runs on port 12345)
pnpm dev

# Build & Start
pnpm build              # Production build
pnpm start              # Start production server (runs db:migrate && db:seed first)
pnpm preview            # Build and preview locally

# Database
pnpm db:migrate:dev     # Development migration with interactive prompts
pnpm db:migrate         # Deploy migrations (production)
pnpm db:push            # Push schema changes without migration files
pnpm db:studio          # Open Prisma Studio
pnpm db:seed            # Run seed script

# Code Quality
pnpm lint               # Run ESLint with auto-fix
pnpm type-check         # TypeScript type check (tsc --noEmit)
```

## Architecture

### Dual API Architecture

项目同时使用两种 API 架构：

1. **tRPC** (`src/server/api/`) - 主 API，用于类型安全的 CRUD 操作
   - 路由位置: `src/server/api/routers/`
   - 路由列表: asset, keep, mindMap, moment, todo, user
   - 入口: `src/server/api/root.ts`
   - 处理器: `src/app/api/trpc/[trpc]/route.ts`

2. **Hono** (`src/server/hono/`) - 辅助 API，用于特殊路由
   - 入口: `src/server/hono/index.ts`
   - 路由: `/api/sync/telegram`, `/api/tts`, `/api/internal`, `/api/lp`
   - 挂载点: `/api` (basePath)

### Authentication

- JWT-based cookie authentication
- Cookie name: `authorization`
- tRPC 提供三种 procedure:
  - `publicProcedure` - 公开接口
  - `protectedProcedure` - 需要登录
  - `adminProcedure` - 需要管理员权限

### Request ID Tracking

使用 AsyncLocalStorage 在异步上下文中追踪请求 ID，用于日志关联。

### Database Schema Highlights

关键模型:
- **User** - 用户，支持用户组
- **Keep** - Markdown 笔记
- **Moment** - 动态/瞬间 (类似微博)
- **Todo** - 待办事项
- **MindMap** - 思维导图数据
- **Image** - 图片管理，支持向量搜索 (`vector(3072)`)
- **File/Bucket** - 多存储提供商文件管理 (S3/R2/COS/Oracle)

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (full-layout)/      # 带完整布局的页面
│   ├── (no-layout)/        # 无布局页面 (全屏编辑器)
│   └── api/                # API 路由处理器
├── components/
│   ├── ui/                 # 基础 UI 组件 (基于 Radix UI)
│   ├── hoc/                # 高阶组件
│   └── layout/             # 布局组件
├── hooks/                  # 自定义 React Hooks
├── lib/                    # 核心库 (error-handler, telegram, ffmpeg)
├── server/
│   ├── api/                # tRPC 配置和路由
│   ├── hono/               # Hono 路由
│   ├── db.ts               # Prisma 客户端
│   └── logger.ts           # Pino 日志配置
├── store/                  # Zustand stores
├── trpc/                   # tRPC 客户端配置
└── utils/                  # 工具函数 (cn 在此)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/env.js` | 环境变量验证 (@t3-oss/env-nextjs) |
| `src/server/api/trpc.ts` | tRPC 配置、中间件、procedure 定义 |
| `src/server/api/root.ts` | tRPC 路由合并 |
| `src/server/hono/index.ts` | Hono 应用实例和认证中间件 |
| `src/server/db.ts` | Prisma 客户端单例 |
| `src/server/logger.ts` | Pino 结构化日志配置 |
| `src/utils/cn.ts` | Tailwind 类名合并工具 (使用 clsx + tailwind-merge) |
| `prisma/schema.prisma` | 数据库模型定义 |
| `next.config.js` | Next.js 配置，含 Turbopack 自定义 loader |

## Code Style Notes

From `.cursorrules`:

- 优先使用函数式组件和 Hooks
- 组件名使用 PascalCase，Props 接口使用 `ComponentNameProps`
- 使用 `cn()` 工具函数进行条件类名渲染，**使用对象语法而非三目运算符**:
  ```tsx
  // ✅ 推荐
  <div className={cn('text-sm', { 'text-blue-500': isActive })} />
  ```
- 导入 cn 函数: `import { cn } from '@/utils/cn'`
- 动画使用 framer-motion 或 Tailwind 动画类
- SSR 注意: 使用 `window`/`document` 时需检查 `typeof window !== 'undefined'`

## Environment Variables

关键变量 (定义在 `src/env.js`):
- `DATABASE_URL` - PostgreSQL 连接字符串
- `JWT_SECRET` - JWT 签名密钥
- `GEMINI_API_KEY` - Gemini AI API 密钥
- `AMAP_KEY` - 高德地图 API 密钥
- `TELEGRAM_API_ENDPOINT` - Telegram API 端点 (默认: http://api.telegram:8000)
- `LOG_LEVEL` - 日志级别 (trace/debug/info/warn/error/fatal)

## Special Features

- **向量搜索**: PostgreSQL pgvector 扩展支持 AI 语义搜索 (Image.description_vector)
- **多存储提供商**: 支持同时配置多个 S3 兼容存储 (R2/COS/Oracle)
- **Telegram 同步**: RxJS 流处理实现消息批处理和去重
- **Turbopack Loader**: 自定义 loader (`loaders/inject-path-loader.mjs`) 注入仓库路径

## Testing

使用 Vitest + @testing-library/react:
- 配置: `vitest.config.mts`
- Setup: `src/test/setup.ts`
- 命令: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`

## Git Hooks

- `pre-commit`: 运行 lint-staged (eslint --fix)
