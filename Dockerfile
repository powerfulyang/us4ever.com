# 构建阶段
FROM node:lts-alpine AS builder

WORKDIR /app

ENV CI=true

# 先复制 package.json 和 pnpm-lock.yaml 用于依赖安装
COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma

ENV NEXT_TELEMETRY_DISABLED=1

# 安装 pnpm（单独一层，以便缓存）
RUN npm install -g pnpm

# 安装依赖（利用缓存）
RUN pnpm install --frozen-lockfile

# 复制其余源代码（放在依赖安装后，因为代码变化更频繁）
COPY . .

ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPUhsOEg_zvQTcBDLIYOctcye7iuSgF4q0gI-Q1_DnaWjD9FcvYVnJlTfsrCcD995RkbeSV0Pxi9h5t2ayRb-yA

# 构建
RUN pnpm run build

# 生产阶段
FROM builder AS production

WORKDIR /app

ENV CI=true

ENV NEXT_TELEMETRY_DISABLED=1

# 安装 ffmpeg（单独一层，便于缓存）
RUN apk update && apk add --no-cache ffmpeg

# 复制必要的文件（按需分层，避免重复构建）
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# 安装 pnpm 和生产依赖
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

#
COPY --from=builder /app/.next ./.next
#
COPY public ./public

# 启动命令
CMD ["pnpm", "run", "start"]
