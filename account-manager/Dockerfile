# Stage 1: React 빌드
FROM node:20-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: 서버 실행
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
RUN mkdir -p /app/data
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
