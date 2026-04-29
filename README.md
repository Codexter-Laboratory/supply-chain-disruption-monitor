# Supply Chain Disruption Monitor

A real-time supply chain monitoring system that simulates global shipping activity, energy price fluctuations, and disruption events — all streamed live through a GraphQL-based architecture.

---

## Overview

This project demonstrates how to build a production-style system with:

- Real-time updates via GraphQL subscriptions  
- Event-driven backend architecture  
- Historical data ingestion (pricing + news)  
- Clean separation of concerns across layers  
- Simulation engine to mimic real-world system behavior  

The frontend dashboard visualizes all activity in real time.

---

## Features

- 🚢 **Ship tracking** with live status updates  
- ⚡ **Event system** (delays, disruptions, incidents)  
- 📈 **Energy price trends** with historical data  
- 📰 **News ingestion** with normalization and deduplication  
- 🔴 **Realtime updates** via GraphQL subscriptions  
- 🧪 **Simulation engine** generating continuous system activity  

---

## Tech Stack

### Backend
- NestJS
- GraphQL (queries + subscriptions)
- PostgreSQL
- Prisma

### Frontend
- React (Vite)
- TypeScript
- TanStack Query
- graphql-ws

---

## Architecture Highlights

- Feature-based modular structure  
- Domain → Application → Infrastructure → Presentation layering  
- No ORM leakage outside infrastructure  
- Realtime isolated via publisher abstraction  
- Cache-level updates for realtime (no unnecessary refetching)  

---

## Project structure

- `backend/` — NestJS GraphQL API (see [`backend/README.md`](backend/README.md) for layering, simulation vs pricing modes, env vars)
- `frontend/` — Vite React app

Example feature layout under `backend/src/`:

```
ships/
events/
pricing/
news/
realtime/
```

---

## Running locally

```bash
docker compose up --build
```

- Backend GraphQL: `http://localhost:3000/graphql`
- Frontend dev server: `http://localhost:5173`

Orchestrator tick (events, pricing ingestion, news, KPI scheduler): set `SIMULATION_ENABLED=true` in `.env`. Energy quote semantics (`simulation` vs `real`): `PRICING_MODE` — see [`backend/docs/pricing-modes.md`](backend/docs/pricing-modes.md).