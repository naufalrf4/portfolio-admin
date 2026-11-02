# syntax=docker/dockerfile:1.7
FROM oven/bun:1.4.3 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages ./packages
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM deps AS dev
WORKDIR /app
COPY . .
ENV NODE_ENV=development PORT=3001
EXPOSE 3001
CMD ["bun", "run", "dev"]

FROM deps AS migrator
COPY . .
CMD ["bun", "run", "db:migrate"]

FROM node:22-bookworm-slim AS builder
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=""
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=""
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
ARG ADMIN_R2_ACCOUNT_ID=""
ARG ADMIN_R2_BUCKET_NAME=""
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV ADMIN_R2_ACCOUNT_ID=$ADMIN_R2_ACCOUNT_ID
ENV ADMIN_R2_BUCKET_NAME=$ADMIN_R2_BUCKET_NAME
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json bun.lock tsconfig.json next.config.js postcss.config.js ./
COPY src ./src
COPY public ./public
COPY drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts
COPY next-env.d.ts ./next-env.d.ts
COPY eslint.config.mjs ./eslint.config.mjs
RUN --mount=type=cache,target=/app/.next/cache \
  NODE_OPTIONS=--max-old-space-size=2048 node /app/node_modules/next/dist/bin/next build \
  && test -f .next/standalone/server.js \
  && mkdir -p .next/standalone/.next \
  && cp -R .next/static .next/standalone/.next/static

FROM node:22-bookworm-slim AS prod
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3001
COPY --from=builder --chown=node:node /app/.next/standalone ./
USER node
EXPOSE 3001
CMD ["node", "server.js"]
