# syntax=docker/dockerfile:1

# Built from the repo root: docker build -f apps/platform/Dockerfile .
#
# NOT part of the current deploy path — docker-compose.yaml only runs
# `api` and `db`. Production serves this app's static build directly from
# disk via NGINX on the host (see deploy/nginx.conf and PRD.md bagian 16,
# "Decision change — deployment architecture"). Kept here because its
# `build` stage is still a reproducible way to produce dist/client (e.g.
# `docker build --target build … && docker cp` to extract it in CI)
# without needing Node on the runner — the `runtime` stage below (an
# nginx:alpine image) is the alternative, containerized way to serve it,
# not what's actually deployed.

FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- deps: install once, cached as long as manifests don't change ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/platform/package.json ./apps/platform/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# ---- build: packages/ui first (platform depends on its built output), ----
# ---- then platform itself                                             ----
FROM deps AS build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY packages/ui ./packages/ui
COPY apps/platform ./apps/platform
RUN pnpm --filter @mycustom/ui build
RUN pnpm --filter platform exec vite build

# ---- runtime: static files only, no Node process ----
FROM nginx:alpine AS runtime
# nginx:alpine ships its own welcome index.html/50x.html; COPY merges into
# the directory rather than replacing it, so those stock files would
# otherwise shadow our SPA fallback for any route without a matching file
# (notably "/" itself — see the note in nginx.conf).
RUN rm -rf /usr/share/nginx/html/*
COPY apps/platform/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/platform/dist/client /usr/share/nginx/html
# The prerenderer doesn't write a file for "/" itself (only for its
# sub-routes), so the webroot directory has no index.html of its own.
# nginx's `try_files $uri $uri/ …` stops at a directory match before it
# ever reaches the SPA-fallback arg, so without this "/" would 403
# instead of falling through — give it the same shell every other
# non-prerendered route gets.
RUN cp /usr/share/nginx/html/_shell.html /usr/share/nginx/html/index.html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
