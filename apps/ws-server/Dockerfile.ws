FROM node:20-alpine AS builder

# Install necessary dependencies including OpenSSL
RUN apk add --no-cache libc6-compat python3 make g++ curl bash

RUN set -ex; \
    apk update; \
    apk add --no-cache \
    openssl

RUN node -v

# Install pnpm
RUN npm install -g pnpm

# Set shell to bash
SHELL ["/bin/bash", "-c"]

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY turbo.json ./
COPY pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/src ./packages/db/src
COPY apps/ws-server/package.json ./apps/ws-server/
COPY apps/ws-server/tsconfig.json ./apps/ws-server/
COPY apps/ws-server/src ./apps/ws-server/src/

# Install dependencies using pnpm
RUN pnpm install

# Modify prisma schema for binary targets if not already done
RUN sed -i '/generator client {/a \  binaryTargets = ["native", "linux-musl-arm64-openssl-1.1.x"]' packages/db/prisma/schema.prisma

# Generate Prisma Client
RUN cd packages/db && npx prisma@5.21.1 generate

# Build the backend app
RUN cd apps/ws-server && pnpm build

FROM node:20-alpine AS runner

RUN set -ex; \
    apk update; \
    apk add --no-cache \
    openssl

# Set working directory for the runner
WORKDIR /app

# Copy necessary files for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/ws-server/package.json ./apps/ws-server/
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=builder /app/packages/db/src ./packages/db/src
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

WORKDIR /app/apps/ws-server
CMD ["node", "dist/index.js"]
