# 个人工具集合应用

这是一个基于 Next.js 15 构建的个人工具集合应用，包含多种实用功能模块。

## 功能模块

- **笔记本**：支持 Markdown 格式的笔记管理
- **思维导图**：基于 simple-mind-map 的思维导图工具
- **待办事项**：简单的 Todo 管理
- **工具集**：包含图片转 Base64 等实用工具

## 技术栈

- **框架**：Next.js 15 (App Router)
- **样式**：Tailwind CSS + CSS Modules
- **状态管理**：React Query + tRPC
- **数据库**：Prisma + PostgreSQL
- **包管理**：pnpm

## 项目结构

- 服务端处理使用 tRPC 11，位于 `src/api` 目录
- 共享逻辑位于 `src/lib` 目录
- UI 组件位于 `src/components` 目录
- 自定义 hooks 位于 `src/hooks` 目录
- TypeScript 类型定义位于 `src/types` 目录
- 工具函数位于 `src/utils` 目录

## 开发指南

### 环境要求

- Node.js LTS
- pnpm latest
- PostgreSQL latest

### 安装依赖

```bash
# 克隆仓库

# 安装依赖
pnpm install
```

### 环境配置

```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 编辑 .env.local 文件，配置数据库连接等必要参数
```

### 数据库设置

```bash
# 运行数据库迁移，非生产环境
pnpm prisma migrate dev

# 生产环境迁移
pnpm prisma migrate deploy

# 生成 Prisma 客户端
pnpm prisma generate
```

### 启动开发服务器

```bash
pnpm dev
```

应用将在 http://localhost:12345 运行。

### 构建生产版本

```bash
pnpm build
pnpm start
```

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

由于项目使用 Next.js 的 SSR 功能，在使用浏览器 API 时需要注意：

```tsx
// 正确使用方式
useEffect(() => {
  // 现在可以安全地访问 window 和 document
  const handleResize = () => {
    // 处理窗口大小变化
  }

  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

## 贡献指南

1. Fork 该仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
