# syntax=docker/dockerfile:1

# Built from the repo root: docker build -f apps/api/Dockerfile .

FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- deps: full workspace install (build needs devDependencies, e.g. tsc) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/platform/package.json ./apps/platform/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# ---- build: generate the Prisma client, type-check, then bundle ----
FROM deps AS build
COPY apps/api ./apps/api
# `prisma7.config.ts` reads DATABASE_URL to build its datasource config;
# `generate` only needs a syntactically valid value, not a reachable one.
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV DATABASE_URL=${DATABASE_URL}
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run typecheck
# tsc emits relative imports without a .js extension (tsconfig uses
# module: "preserve", meant for bundlers), which plain `node` can't resolve
# at runtime — esbuild bundles them into one file instead, sidestepping
# that entirely. See apps/api/package.json "build".
RUN pnpm --filter api run build

# ---- prod-deps: same lockfile, production dependencies only ----
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/platform/package.json ./apps/platform/
COPY packages/ui/package.json ./packages/ui/
# --ignore-scripts: skip the root "prepare" (husky) script, which needs a
# devDependency this prod-only install doesn't have. bcrypt still works —
# its prebuilt musl binary is resolved at require() time, not install time.
RUN pnpm install --frozen-lockfile --prod --filter api --ignore-scripts

# ---- runtime: compiled output + production deps only, no build toolchain ----
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/package.json
# `prisma migrate deploy` (run at deploy time — see docker-compose.yaml and
# .github/workflows/deployment.yaml) needs the schema/migrations and the
# config file that points Prisma at DATABASE_URL. None of these are
# TypeScript compiled into dist/, so they need to be copied explicitly;
# prisma7.config.ts's one import (env.ts) comes along for the same reason.
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/prisma7.config.ts ./apps/api/prisma7.config.ts
COPY --from=build /app/apps/api/src/config/env.ts ./apps/api/src/config/env.ts

WORKDIR /app/apps/api
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
	CMD wget -qO- http://localhost:8000/health | grep -q '"status":"ok"' || exit 1

CMD ["node", "dist/index.js"]
