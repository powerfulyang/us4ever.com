# us4ever.com - 个人工具集合

一个现代化的个人工具集合应用，集成笔记本、思维导图、待办事项、动态分享、图片管理等多个功能模块。

## 功能模块

### 核心功能

| 模块 | 功能描述 | 访问路径 |
|------|----------|----------|
| **笔记本** (Keep) | Markdown 笔记管理，支持富文本编辑、实时预览和 AI 向量搜索 | `/keep/feed` |
| **思维导图** (MindMap) | 基于 simple-mind-map 的交互式思维导图工具，支持 XMind 导入 | `/mindmap/feed` |
| **待办事项** (Todo) | 智能 Todo 管理系统，支持优先级、截止日期和分类 | `/todo/feed` |
| **动态分享** (Moment) | 类似微博的动态分享，支持图片和视频 | `/moment/feed` |
| **图片管理** (Image) | 图片上传与管理，支持 EXIF 解析、缩略图生成和向量搜索 | `/image/feed` |
| **标签聚合** (Tag) | 跨模块的标签聚合浏览 | `/tag` |
| **全局搜索** | AI 语义向量搜索，跨 Keep、Moment、Image | `/search` |

### 工具集成

- **文本对比**: Pandora 文本差异对比工具
- **JSON Viewer**: JSON 数据可视化
- **图片转 Base64**: 图片格式转换工具
- **视频列表**: 上传视频管理

## 技术栈

### 核心框架

- **Next.js 16** (App Router) - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 严格模式类型安全

### API 架构

- **tRPC 11** - 端到端类型安全 API (主 API)
- **Hono 4** - 轻量高性能 API (辅助路由)

### 数据层

- **PostgreSQL** - 关系型数据库
- **Prisma 7** -现代化 ORM
- **pgvector** - 向量搜索扩展

### 状态管理

- **Zustand** - 客户端轻量状态管理
- **React Query** - 服务端状态管理

### UI & 样式

- **Tailwind CSS v4** - 原子化 CSS 框架
- **Radix UI** - 无样式 UI 组件库
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 开发工具

- **ESLint** (@antfu/eslint-config) - 代码质量检查
- **Vitest** - 单元测试框架
- **pnpm** - 高效包管理器
- **Pino** - 结构化日志系统

### AI 功能

- **Google Gemini** - AI Embedding 生成和向量搜索

## 项目架构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── (full-layout)/      # 带完整布局的页面
│   │   ├── keep/           # 笔记模块
│   │   ├── todo/           # 待办模块
│   │   ├── mindmap/        # 思维导图
│   │   ├── moment/         # 动态分享
│   │   ├── image/          # 图片管理
│   │   ├── tag/            # 标签聚合
│   │   ├── search/         # 全局搜索
│   │   ├── profile/        # 用户资料
│   │   ├── admin/          # 管理面板
│   │   └── page.tsx        # 首页
│   ├── (no-layout)/        # 无布局的全屏页面
│   │   └── mindmap/[id]/   # 全屏思维导图编辑
│   └── api/                # API 路由处理器
│       ├── trpc/[trpc]/    # tRPC 处理
│       └── [[...route]]/   # Hono 挂载点
│
├── components/
│   ├── ui/                 # 基础 UI 组件 (Radix UI)
│   ├── layout/             # 布局组件
│   ├── hoc/                # 高阶组件 (错误边界、加载状态)
│   ├── auth/               # 认证相关组件
│   ├── md-render/          # Markdown 渲染 (支持 Mermaid、KaTeX)
│   ├── user/               # 用户相关组件
│   ├── pwa/                # PWA 和推送通知
│   └── theme-*.tsx         # 主题切换
│
├── server/
│   ├── api/                # tRPC 路由
│   │   ├── routers/        # 业务路由 (admin/keep/todo/moment/...)
│   │   ├── trpc.ts         # 中间件和权限控制
│   │   └ root.ts           # 路由合并
│   ├── hono/               # Hono API
│   │   ├── routes/         # 辅助路由 (tts/telegram/lp)
│   │   └ index.ts          # 应用实例
│   ├── db.ts               # Prisma 客户端
│   └ logger.ts             # Pino 日志配置
│
├── service/                # 业务逻辑服务层
│   ├── keep/               # Keep 服务 (CRUD/搜索/向量)
│   ├── moment/             # Moment 服务
│   ├── upload/             # 上传服务
│   ├── s3/                 # 多云存储服务
│   ├── vector-search/      # 向量搜索
│   └ embedding/            # AI Embedding
│
├── hooks/                  # 自定义 React Hooks
│   ├── use-loading         # 加载状态管理
│   ├── use-error-handler   # 错误处理
│   └── use-image-upload    # 图片上传
│
├── store/                  # Zustand 状态管理
│   ├── user                # 用户状态
│   └ mind-map-note         # 思维导图编辑状态
│
├── lib/                    # 核心工具库
│   ├── error-handler       # 统一错误处理
│   ├── telegram            # Telegram API (RxJS)
│   ├── ffmpeg              # 视频处理
│   └ fetch                 # 增强的 fetch
│
├── trpc/                   # tRPC 客户端配置
│   ├── react.tsx           # React Provider
│   ├── server.ts           # 服务端 caller
│   └ query-client.ts       # React Query 配置
│
├── utils/                  # 工具函数
│   ├── cn                  # Tailwind 类名合并
│   ├── request-id          # Request ID 生成
│   └ redact                # 敏感信息脱敏
│
└── env.js                  # 环境变量验证
```

## 开发指南

### 环境要求

- **Node.js** 18+ LTS
- **pnpm** 8+
- **PostgreSQL** 14+ (需安装 pgvector 扩展)

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/powerfulyang/us4ever.com.git
cd us4ever.com

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，配置数据库连接等必需变量

# 4. 数据库设置
pnpm db:migrate:dev     # 运行开发迁移
pnpm db:seed            # 填充种子数据

# 5. 启动开发服务器
pnpm dev
```

应用将在 http://localhost:12345 运行。

### 可用脚本

```bash
# 开发
pnpm dev                    # 启动开发服务器 (端口 12345)

# 构建
pnpm build                  # 生产构建
pnpm start                  # 启动生产服务器 (自动执行迁移和种子)
pnpm preview                # 本地构建并预览

# 数据库
pnpm db:migrate:dev         # 开发迁移 (交互式命名)
pnpm db:migrate             # 生产迁移部署
pnpm db:push                # 快速推送 schema (无迁移文件)
pnpm db:studio              # 打开 Prisma Studio
pnpm db:seed                # 执行种子脚本

# 代码质量
pnpm lint                   # ESLint 检查 + 自动修复
pnpm type-check             # TypeScript 类型检查

# 测试
pnpm test                   # 运行 Vitest 测试
```

### 环境变量配置

创建 `.env.local` 文件：

```env
# 必需变量
DATABASE_URL="postgresql://user:password@localhost:5432/us4ever"
JWT_SECRET="your-jwt-secret-key"
VAPID_PRIVATE_KEY="web-push-private-key"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="web-push-public-key"

# 可选变量
GEMINI_API_KEY="your-gemini-api-key"     # AI 向量搜索
AMAP_KEY="your-amap-key"                 # 高德地图
TELEGRAM_API_ENDPOINT="http://api.telegram:8000"
LOG_LEVEL="info"                         # 日志级别
```

### 代码规范

#### CSS 条件类名

使用 `cn()` 工具函数的**对象语法**：

```tsx
import { cn } from '@/utils/cn'

// 推荐
<div className={cn(
  'text-sm',
  {
    'text-blue-500': isActive,
    'opacity-50': isDisabled
  }
)} />
```

#### 错误处理

使用统一的错误处理系统：

```tsx
import { createError, transformError } from '@/lib/error-handler'

// 创建标准错误
throw createError.notFound('Resource not found')

// 转换未知错误
const appError = transformError(unknownError)
```

#### SSR 注意事项

```tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    // 仅在客户端执行的浏览器 API 操作
  }
}, [])
```

## 核心特性

### AI 向量搜索

- PostgreSQL pgvector 扩展支持
- 使用 Gemini API 生成 Embedding
- 跨 Keep、Moment、Image 的语义搜索
- 向量维度: 3072

### 多存储提供商

支持同时配置多个 S3 兼容存储：

- Cloudflare R2
- 腾讯云 COS
- Oracle OSS

### Telegram 同步

- RxJS 流处理消息批处理
- 支持多频道同步
- 自动去重和错误处理

### Web Push 推送

- VAPID 认证
- 浏览器推送订阅管理
- 支持多设备订阅

### 动态背景效果

- 亮色模式: Canvas 粒子动画
- 暗色模式: Canvas 星空背景

## 部署

### 生产环境部署

```bash
# 构建
pnpm build

# 启动 (自动执行数据库迁移)
pnpm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t us4ever .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  us4ever
```

## 监控与分析

项目集成了多个监控工具：

- **Sentry** - 错误追踪和性能监控
- **Grafana** - 开源分析和监控平台
- **Umami** - 网站访问统计分析
- **Uptime Kuma** - 服务器监控

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

---

> **AI 文档说明**: 本项目的 `CLAUDE.md` 和 `AGENTS.md` 文件为 AI 编码助手提供项目上下文，帮助 AI 更好地理解项目结构和规范。