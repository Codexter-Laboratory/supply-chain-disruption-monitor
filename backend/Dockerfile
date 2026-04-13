# Build from monorepo root: `docker compose -f backend/docker-compose.yml build`
# (needs `shared/domain/maritime-intelligence` for `file:../shared/...` in package.json)

FROM node:20-bullseye AS builder
WORKDIR /repo

# Shared package (backend depends on file:../shared/domain/maritime-intelligence)
COPY shared/domain/maritime-intelligence ./shared/domain/maritime-intelligence/
WORKDIR /repo/shared/domain/maritime-intelligence
RUN npm install && npm run build

WORKDIR /repo/backend
ENV DATABASE_URL="postgresql://scm:scm@localhost:5432/supply_chain_monitor?schema=public"

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
# Shared is already built; skip postinstall that assumes host paths inside Docker
RUN npm ci --ignore-scripts

COPY backend/ .
RUN npx prisma generate
RUN npm run build

# --- runtime ---
FROM node:20-bullseye AS runner
WORKDIR /repo
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://scm:scm@postgres:5432/supply_chain_monitor?schema=public"

COPY --from=builder /repo .

WORKDIR /repo/backend
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
