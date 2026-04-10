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

## Project Structure
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

## Project Structure
backend/
ships/
events/
pricing/
news/
realtime/

frontend/
features/
services/
app/

---

## Running locally

```bash
docker compose up --build
- Backend: http://localhost:3000/graphql
- Frontend: http://localhost:5173

Enable simulation:

SIMULATION_ENABLED=true