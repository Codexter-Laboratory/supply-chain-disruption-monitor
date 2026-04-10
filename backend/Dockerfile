# --- dependencies & prisma client ---
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma loads `DATABASE_URL` at generate time; no live DB required for client codegen.
ENV DATABASE_URL="postgresql://scm:scm@localhost:5432/supply_chain_monitor?schema=public"

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# --- runtime (migrations + seed + API) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Overridden at runtime by docker-compose / orchestrator.
ENV DATABASE_URL="postgresql://scm:scm@localhost:5432/supply_chain_monitor?schema=public"

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm install prisma@5.22.0

COPY --from=builder /app/dist ./dist

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
