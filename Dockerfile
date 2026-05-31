FROM node:22-bookworm-slim AS base

WORKDIR /app

FROM base AS deps

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci

FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps ./apps
RUN npm run build

FROM deps AS prod-deps

RUN npm prune --omit=dev && npm cache clean --force

FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV APP_PORT=3000

COPY --from=prod-deps /app/package*.json ./
COPY --from=prod-deps /app/apps/api/package.json ./apps/api/package.json
COPY --from=prod-deps /app/apps/web/package.json ./apps/web/package.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/web/dist ./apps/web/dist

RUN mkdir -p /app/data && chown -R node:node /app/data

EXPOSE 3000

USER node

CMD ["node", "apps/api/dist/main.js"]
