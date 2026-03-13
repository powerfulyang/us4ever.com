# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 (App Router) 构建的现代化个人工具集合应用，采用 TypeScript + tRPC + Prisma + PostgreSQL 技术栈喵～

## 开发命令

```bash
# 开发
pnpm dev                    # 启动开发服务器 (http://localhost:12345)
pnpm dev:turbopack          # 使用 Turbopack 启动开发服务器

# 构建与运行
pnpm build                  # 构建生产版本
pnpm start                  # 启动生产服务器 (自动运行迁移和种子)
pnpm preview                # 构建并预览

# 数据库操作
pnpm db:generate            # 生成 Prisma 客户端
pnpm db:migrate             # 运行数据库迁移
pnpm db:seed                # 填充测试数据
pnpm db:studio              # 打开 Prisma Studio
pnpm db:push                # 推送 schema 到数据库

# 代码质量
pnpm lint                   # 运行 ESLint
pnpm lint:fix               # 修复 ESLint 错误
pnpm typecheck              # TypeScript 类型检查

# 测试
pnpm test                   # 运行测试
pnpm test:watch             # 监听模式运行测试
pnpm test:coverage          # 生成测试覆盖率报告
```

## 项目架构

### 核心目录结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── (full-layout)/      # 带完整布局的页面组
│   └── (no-layout)/        # 无布局的演示页面
├── components/             # React 组件
│   ├── ui/                # 基础 UI 组件库
│   ├── hoc/               # 高阶组件
│   └── layout/            # 布局组件
├── hooks/                 # 自定义 React Hooks
├── lib/                   # 核心库和工具
├── server/                # 服务端代码
│   ├── api/               # tRPC 路由 (routers/)
│   ├── hono/              # Hono 路由 (routes/)
│   └── db.ts              # Prisma 数据库配置
├── store/                 # Zustand 状态管理
├── utils/                 # 工具函数 (包含 cn 工具)
├── types/                 # TypeScript 类型定义
└── test/                  # 测试配置
```

### 技术架构

- **API 层**: tRPC 11 负责类型安全的 API 通信，Hono 用于特定路由 (如 TTS、同步等)
- **数据库**: Prisma ORM + PostgreSQL，Schema 定义在 `prisma/schema.prisma`
- **状态管理**: Zustand (客户端) + React Query (服务端状态)
- **UI 框架**: React 19 + Tailwind CSS + Framer Motion
- **包管理**: pnpm

### 核心数据模型 (Prisma)

- `User` - 用户账户
- `Keep` - 笔记/收藏
- `Todo` - 待办事项
- `MindMap` - 思维导图
- `Moment` - 动态/朋友圈
- `Image` / `File` / `Video` - 媒体资源
- `Bucket` - 存储桶配置

## 代码规范

### 组件开发

- 使用函数式组件和 TypeScript
- 组件名使用 PascalCase
- Props 接口使用 `ComponentNameProps` 命名

### CSS 条件渲染

使用 `cn` 工具函数 (路径：`@/utils/cn`)：

```tsx
import { cn } from '@/utils/cn'

// ✅ 推荐
<div className={cn('text-sm', { 'text-blue-500': isActive, 'opacity-50': isDisabled })} />
```

### SSR 注意事项

使用浏览器 API 时需在 `useEffect` 中执行：

```tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    // 浏览器 API 调用
  }
}, [])
```

## 配置文件

- `next.config.js` - Next.js 配置 (Webpack loaders、安全 headers)
- `tsconfig.json` - TypeScript 配置 (严格模式、路径别名 `@/*`)
- `vitest.config.mts` - Vitest 测试配置 (覆盖率门槛 80%)
- `eslint.config.js` - ESLint 配置 (基于 @antfu/eslint-config)

## Cursor Rules

项目包含 `.cursorrules` 文件，定义了：
- 组件开发规范
- CSS 条件渲染最佳实践
- 动画使用 framer-motion
- SSR 环境下的 window/document 处理

## 环境要求

- Node.js 18+ LTS
- pnpm 8+
- PostgreSQL 14+
