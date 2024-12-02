# 使用 Node.js LTS 版本镜像
FROM node:lts

# 设置工作目录
WORKDIR /app

# 复制项目文件到容器中
COPY . .

# 安装 pnpm
# 安装依赖
# build
RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build

# 容器启动命令（可选，根据项目需求调整）
CMD ["pnpm","run","start"]
