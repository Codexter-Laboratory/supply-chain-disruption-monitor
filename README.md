# Supply Chain Disruption Monitor

A real-time system for monitoring global supply chain activity, combining shipping data, energy prices, and news signals into a unified dashboard.

## Features

- 🚢 Ship tracking with live status updates
- ⚡ Event-driven system (delays, incidents, disruptions)
- 📈 Energy price monitoring with trends
- 📰 News aggregation with deduplication
- 🔴 Real-time updates via GraphQL subscriptions
- 🧪 Simulation engine to mimic real-world activity

## Tech Stack

- Backend: NestJS, GraphQL, PostgreSQL, Prisma
- Realtime: GraphQL Subscriptions
- Architecture: Feature-based, clean separation of concerns

## Architecture Highlights

- Domain / Application / Infrastructure / Presentation layering
- No ORM leakage outside infrastructure
- Realtime isolated via publisher pattern
- Consistent modular design across features

## Project Structure
backend/
ships/
events/
pricing/
news/
realtime/


## Running locally

```bash
docker compose up --build