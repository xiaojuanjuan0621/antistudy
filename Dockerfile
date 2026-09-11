FROM node:20-alpine

# 安装编译 SQLite 依赖工具
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY . .

EXPOSE 3300

CMD ["npm", "start"]
