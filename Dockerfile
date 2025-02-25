# 构建阶段
FROM node:lts AS builder

WORKDIR /app

# 先复制 package.json 和 pnpm-lock.yaml 用于依赖安装
COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma

# 安装 pnpm（单独一层，以便缓存）
RUN npm install -g pnpm

# 安装依赖（利用缓存）
RUN pnpm install --frozen-lockfile

# 复制其余源代码（放在依赖安装后，因为代码变化更频繁）
COPY . .

# 构建
RUN pnpm run build

# 生产阶段
FROM node:lts AS production

WORKDIR /app

# 安装 ffmpeg（单独一层，便于缓存）
RUN apt-get update && apt-get install -y ffmpeg

# 复制必要的文件（按需分层，避免重复构建）
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY public ./public

# 安装 pnpm 和生产依赖
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next ./.next

# 启动命令
CMD ["pnpm", "run", "start"]
