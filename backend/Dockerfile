# --- dependencies & prisma client ---
    FROM node:20-bullseye AS builder
    WORKDIR /app
    
    # Prisma needs DATABASE_URL at generate time (dummy is fine)
    ENV DATABASE_URL="postgresql://scm:scm@localhost:5432/supply_chain_monitor?schema=public"
    
    COPY package.json package-lock.json ./
    COPY prisma ./prisma/
    RUN npm ci
    
    COPY . .
    RUN npx prisma generate
    RUN npm run build
    
    # --- runtime (migrations + seed + API) ---
    FROM node:20-bullseye AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV DATABASE_URL="postgresql://scm:scm@postgres:5432/supply_chain_monitor?schema=public"
    
    COPY package.json package-lock.json ./
    COPY prisma ./prisma/
    
    # Install deps
    RUN npm ci --omit=dev
    
    # Copy built app
    COPY --from=builder /app/dist ./dist
    
    # Generate Prisma client again (safe)
    RUN npx prisma generate
    
    EXPOSE 3000
    
    CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]