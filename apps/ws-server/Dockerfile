FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g turbo

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/src ./packages/db/src
COPY apps/ws-server/package.json ./apps/ws-server/
COPY apps/ws-server/src ./apps/ws-server/src
COPY apps/ws-server/tsconfig.json ./apps/ws-server/
RUN npm install
RUN cd packages/db && npx prisma generate
RUN turbo run build --filter=ws-server...
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/ws-server/package.json ./apps/ws-server/
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=builder /app/packages/db/src ./packages/db/src
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000
WORKDIR /app/apps/ws-server
CMD ["node", "dist/index.js"]
