# Supply Chain Disruption Monitor — API

NestJS GraphQL API with Prisma and PostgreSQL.  
This API powers a real-time supply chain monitoring system with event-driven updates, historical data ingestion, and GraphQL subscriptions.

---

## Architecture overview

- **Framework**: NestJS with **GraphQL** (Apollo driver, **graphql-ws** for subscriptions)
- **Persistence**: **Prisma** + **PostgreSQL**
- **Modular design**: Feature-based bounded contexts

Each feature follows a strict layered architecture:

  `domain` → `application` → `infrastructure` → `presentation`

---

### Cross-cutting modules

- `src/common/` — shared **types**, **utils**, and **errors** (no business logic)
- `src/database/` — Prisma service and database module
- `src/simulation/` — orchestrator service triggering system activity (no direct DB or realtime logic)
- `src/realtime/` — realtime publisher abstraction and GraphQL subscription layer

---

### Data flow

Reads:
**GraphQL resolver** → **Application Service** → **repository port** → **Prisma** → **PostgreSQL**.

Writes: 
**Simulation** → **Application Service** → **DB (events + ships)** → **Realtime Publisher** → **GraphQL Subscriptions**.


---

## Module structure (`src/`)

| Area | Role |
|------|------|
| `ships` | Ship aggregate with pagination and status transitions |
| `events` | Supply-chain events with persistence and realtime emission |
| `pricing` | Energy price ingestion and trend queries (Nest layers use `infra/` for adapter/factory helpers and `infrastructure/` for Prisma adapters) |
| `news` | News ingestion with normalization and deduplication |
| `routes` | Route-related structures (basic support) |
| `health` | Health check query (operational) |
| `realtime` | Realtime event publishing + GraphQL subscriptions |

Each feature (except `simulation`) follows the full layered structure.  
Resolvers and Nest modules live under `presentation/`.

---

## Simulation

When `SIMULATION_ENABLED=true`, the orchestrator runs on a fixed interval and drives application-layer ticks:

- generates supply chain events  
- updates ship statuses  
- runs pricing ingestion (see **Pricing ingestion** below)  
- ingests news (mock or RSS)  

This lets the demo feel live without requiring you to trigger work manually.

### Pricing ingestion

`SIMULATION_ENABLED` drives **whether** ingestion ticks run. **`PRICING_MODE`** selects **how** energy quotes are produced on each pricing tick (`simulation` vs `real`). See [`docs/pricing-modes.md`](docs/pricing-modes.md); broader readiness notes live in [`docs/source-modes.md`](docs/source-modes.md).


---

## Prerequisites

- Node.js 20+
- npm
- Docker (optional)

---

## Local setup

### 1. Install dependencies

```bash
   cd backend
   npm ci
```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL` to your PostgreSQL instance (in `.env`, see `.env.example`).

3. **Database setup**

   ```bash
   export DATABASE_URL="postgresql://..."   # if not already in .env for your shell
   npx prisma generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

   - `prisma:migrate` — apply development migrations (`prisma migrate dev`).
   - `prisma:deploy` — apply existing migrations in CI/production (`prisma migrate deploy`).
   - `prisma:seed` — seeds, runs `prisma/seed.cjs` (~42 synthetic ships; idempotent via `upsert` on `imo`).

4. **Run the API**

   ```bash
   npm run start:dev
   ```
   - GraphQL endpoint: http://localhost:3000/graphql
   - Subscriptions: graphql-ws protocol
   (GraphQL HTTP is served at **`/graphql`** (Nest + Apollo default). Subscriptions use the **graphql-ws** protocol on the same server.)

### Pagination (ships)
   query {
   ships(offset: 0, limit: 10) {
      total
      offset
      limit
      items {
         id
         name
         status
      }
   }
   }
   Query `ships` accepts:

   - `offset` (default `0`)
   - `limit` (default `20`, clamped to **1–100**)

Returns a `ShipPage` object: `items`, `total`, `offset`, `limit`.

### GraphQL subscriptions (realtime)

Subscriptions are defined under `src/realtime/presentation/` (e.g. `shipStatusChanged`, `supplyChainEventCreated`, `energyPriceUpdated`) and use the in-process PubSub bridge.

## Docker (PostgreSQL + API)

From `backend/`:

```bash
docker compose up --build
```

- **postgres**: `localhost:5432` — user `scm`, password `scm`, database `supply_chain_monitor`.
- **api**: `localhost:3000` — image runs `prisma migrate deploy`, `prisma db seed`, then `node dist/main.js`.

Override variables in `docker-compose.yml` or with a Compose `env_file` as needed.

## npm scripts (summary)

| Script | Purpose |
|--------|---------|
| `start:dev` | API with watch mode |
| `build` | Compile Nest app |
| `start:prod` | Run compiled `dist/main` |
| `prisma:generate` | Generate Prisma Client |
| `prisma:migrate` | Create/apply dev migrations |
| `prisma:deploy` | Apply migrations (production-style) |
| `prisma:seed` | Run seed script |
| `prisma:studio` | Prisma Studio |

## Prisma seed

Configured in `package.json` under `"prisma": { "seed": "node prisma/seed.cjs" }`. The script is **CommonJS** so it runs in minimal/production images without a TypeScript runner.

---

For schema changes, add migrations with `npm run prisma:migrate` and commit the `prisma/migrations/` directory.
