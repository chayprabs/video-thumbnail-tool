FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-worker-runtime/package.json packages/shared-worker-runtime/
COPY apps/worker/package.json apps/worker/

RUN corepack prepare pnpm@10.33.3 --activate && pnpm install --frozen-lockfile || pnpm install

COPY . .

RUN pnpm --filter @clip-tools/shared-types build \
    && pnpm --filter @clip-tools/shared-worker-runtime build \
    && pnpm --filter @clip-tools/worker build

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8787/health || exit 1

CMD ["node", "apps/worker/dist/index.js"]
