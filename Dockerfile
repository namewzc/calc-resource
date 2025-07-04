# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
# 添加网络重试机制
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install --no-package-lock

COPY . .
RUN npm run build

# 运行阶段
FROM nginx:stable-alpine

# 复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html
# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 8001

# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 