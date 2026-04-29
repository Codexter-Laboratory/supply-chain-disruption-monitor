# Pricing ingestion modes (`PRICING_MODE`)

See also **[`source-modes.md`](source-modes.md)** for cross-cutting source-mode env keys (pricing is one domain).

Energy price **quotes** (what runs on each ingestion tick) are selected by **`PRICING_MODE`**:

| Value | Meaning |
|--------|----------|
| `simulation` (default) | `SimulationEnergyPriceQuoteProvider` generates synthetic quotes. External HTTP is not required. |
| `real` | `RealEnergyPriceQuoteProvider` merges static commodity baselines with **live** commodity prices returned by **`ExternalPricingApiPort`** (`EXTERNAL_PRICING_API`). Today that adapter calls the configured commodity API via **`HttpClientPort`**; only **OIL** is overridden from the HTTP response (`BRENT`); remaining commodities remain static until future migration work expands coverage. |

**`SIMULATION_ENABLED`** controls the **orchestrator** (scheduled ticks across events, pricing ingestion, news, KPI scheduling). It is independent of `PRICING_MODE`: you can run `PRICING_MODE=real` with `SIMULATION_ENABLED=false` only if something else invokes ingestion, or enable the tick with simulation vs real quotes as above.

Related env vars (see `.env.example`):

- `PRICING_API_BASE_URL`, `PRICING_API_KEY` — base URL and key for **`RealPricingApiAdapter`** when `PRICING_MODE=real`.
