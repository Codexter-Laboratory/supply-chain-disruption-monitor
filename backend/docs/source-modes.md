# Source modes (readiness / configuration)

Independent env keys describe **how each bounded context is intended** to resolve data (`simulation`, `real`, or future `hybrid`). They centralize readiness for migration work; **routing to live providers happens only where code already exists.**

| Concept | Meaning |
|--------|---------|
| `simulation` | Internal / synthetic generators and mocks (today’s default paths). |
| `real` | External or live-backed providers **where implemented**. Setting a domain to `real` does not activate missing integrations. |
| `hybrid` | Reserved for live-first behaviour with deterministic fallback (`hybrid` is not active for pricing until the quote provider factory explicitly supports it; `PRICING_MODE` still resolves to `simulation` or `real` for the factory via `getPricingMode()`). |

## Environment variables

| Variable | Parses as `SourceMode` | Default |
|----------|------------------------|---------|
| `PRICING_MODE` | Via `parseSourceMode`; **only `real`** selects the real quote path in code (see [`pricing-modes.md`](pricing-modes.md)). | `simulation` |
| `NEWS_MODE` | Intent for news ingestion | `simulation` |
| `VESSEL_TRACKING_MODE` | Intent for vessel tracking | `simulation` |
| `ROUTES_MODE` | Intent for routes | `simulation` |
| `EVENTS_MODE` | Intent for supply-chain events sourcing | `simulation` |

**Orchestration:** **`SIMULATION_ENABLED`** only controls whether the **scheduled orchestrator tick** runs (events, pricing ingestion, news, KPI scheduler). It is **not** a source-mode selector.

## Current “real” implementation scope

Today, **pricing** may use live commodity HTTP **only when** `PRICING_MODE` resolves to **`real`** in `getPricingMode()` (`parseSourceMode`; only `simulation` and `real` affect the pricing factory—and only **OIL/BRENT** is wired via the external adapter).

**Vessel tracking (`VESSEL_TRACKING_MODE=real`)** uses provider-configured HTTP (`AIS_API_BASE_URL`, `AIS_API_KEY`, optional `AIS_PROVIDER_NAME`) to fetch positions **only for IMOs already stored on ships**; responses are normalized conservatively (no new ships from AIS). Ingestion remains opt-in (not scheduled by default).

**Observability:** GraphQL query **`vesselTrackingHealth`** returns in-memory provider + ingestion freshness counters (resets on app restart). The existing **`health`** query is unchanged. Nothing is scheduled automatically.

Other domains read their mode string at startup (see `SourceModeBootstrap` logs) but do **not** branch runtime behaviour yet on these env vars unless existing code paths already consulted them.
