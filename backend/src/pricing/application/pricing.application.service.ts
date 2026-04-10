import { Inject, Injectable } from '@nestjs/common';
import type { EnergyPrice, EnergyPriceKind } from '../domain/energy-price.entity';
import type { EnergyPriceTrend, TrendDirection } from '../domain/energy-price-trend';
import {
  ENERGY_PRICE_QUOTE_PROVIDER,
  type EnergyPriceQuoteProviderPort,
} from './energy-price-quote.provider.port';
import {
  ENERGY_PRICE_REPOSITORY,
  type EnergyPriceRepositoryPort,
} from './energy-price.repository.port';

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;
const DEFAULT_TREND_POINTS = 24;
const MAX_TREND_POINTS = 500;

function simpleTrendFromSeries(values: readonly string[]): TrendDirection {
  if (values.length < 2) {
    return 'FLAT';
  }
  const a = Number(values[0]);
  const b = Number(values[values.length - 1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return 'FLAT';
  }
  if (a === b) {
    return 'FLAT';
  }
  return b > a ? 'UP' : 'DOWN';
}

/**
 * Pricing reads + ingestion orchestration (quotes → persist → optional realtime later).
 */
@Injectable()
export class PricingApplicationService {
  constructor(
    @Inject(ENERGY_PRICE_REPOSITORY)
    private readonly prices: EnergyPriceRepositoryPort,
    @Inject(ENERGY_PRICE_QUOTE_PROVIDER)
    private readonly quotes: EnergyPriceQuoteProviderPort,
  ) {}

  async listRecent(
    limit: number,
    type?: EnergyPriceKind,
  ): Promise<readonly EnergyPrice[]> {
    const raw = Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_LIST_LIMIT;
    const safe = Math.min(Math.max(raw, 1), MAX_LIST_LIMIT);
    return this.prices.findRecent(safe, type);
  }

  /** Latest `limit` points for one kind, oldest→newest, with first-vs-last direction. */
  async energyPriceTrend(
    kind: EnergyPriceKind,
    limit: number,
  ): Promise<EnergyPriceTrend> {
    const raw = Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_TREND_POINTS;
    const safe = Math.min(Math.max(raw, 2), MAX_TREND_POINTS);
    const points = await this.prices.findSeriesChronological(kind, safe);
    return {
      kind,
      points,
      simpleTrend: simpleTrendFromSeries(points.map((p) => p.value)),
    };
  }

  /** Simulation / scheduler: pull quotes and append history. */
  async ingestionTick(): Promise<void> {
    const batch = await this.quotes.fetchQuotes();
    for (const q of batch) {
      await this.prices.insert({
        type: q.type,
        value: q.value,
        timestamp: q.at,
      });
    }
  }
}
