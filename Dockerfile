FROM node:20-alpine AS base

FROM base as builder

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

RUN npm install -g turbo
COPY . .

RUN turbo prune backend --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json .
RUN npm install

COPY --from=builder /usr/src/app/out/full .
RUN corepack enable && corepack prepare yarn@stable --activate
RUN  npx  turbo run build --filter=backend...

FROM base AS runner
WORKDIR /usr/src/app

COPY --from=installer /usr/src/app .

RUN npm run prisma:generate

EXPOSE 3001 

CMD [ "npm", "run", "start:backend" ]

