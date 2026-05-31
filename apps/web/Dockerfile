FROM node:22-bookworm-slim AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/web/package.json apps/web/

RUN corepack prepare pnpm@10.33.3 --activate && pnpm install

COPY packages/shared-types packages/shared-types
COPY apps/web apps/web
COPY tsconfig.base.json ./

RUN pnpm --filter @clip-tools/shared-types build \
    && cd apps/web && pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV WORKER_URL=http://worker:8787

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
