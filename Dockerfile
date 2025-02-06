# 构建阶段
FROM node:lts AS builder

# 设置工作目录
WORKDIR /app

# 复制其余源代码
COPY . .

# 安装 pnpm
RUN npm install -g pnpm
# 安装依赖
RUN pnpm install --frozen-lockfile
# 构建
RUN pnpm run build

# 生产阶段
FROM node:lts AS production

WORKDIR /app

# 安装 ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# 复制 prisma
COPY prisma ./prisma
# 复制 public 文件夹
COPY public ./public
# 复制 package.json, pnpm-lock.yaml, prisma 文件夹
COPY package.json pnpm-lock.yaml ./
# 从构建阶段复制构建产物
COPY --from=builder /app/.next ./.next

# 安装 pnpm 和生产依赖
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

# 启动命令
CMD ["pnpm", "run", "start"]
