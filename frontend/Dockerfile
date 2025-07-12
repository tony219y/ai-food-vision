# Development Dockerfile สำหรับ local
FROM node:20-alpine

WORKDIR /app

# คัดลอก package.json และ yarn.lock
COPY package.json yarn.lock ./

# ติดตั้ง dependencies
RUN yarn

# คัดลอก source code
COPY . .

# Expose port
EXPOSE 5173

# รัน dev server
CMD ["yarn", "dev", "--host", "0.0.0.0"]