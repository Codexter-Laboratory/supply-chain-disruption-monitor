import { Inject, Injectable } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import {
  REALTIME_PUBLISHER,
  type RealtimePublisherPort,
} from '../../realtime/application/realtime-publisher.port';
import { EnergyPriceRecordedRealtimeEvent } from '../../realtime/domain/energy-price-recorded.realtime-event';
import type { EnergyPrice } from '../domain/energy-price.entity';
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

function emptyCommodityUnitPrices(): Record<CommodityType, number> {
  const out = {} as Record<CommodityType, number>;
  for (const c of Object.values(CommodityType) as CommodityType[]) {
    out[c] = 0;
  }
  return out;
}

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
    @Inject(REALTIME_PUBLISHER)
    private readonly realtime: RealtimePublisherPort,
  ) {}

  async listRecent(
    limit: number,
    type?: CommodityType,
  ): Promise<readonly EnergyPrice[]> {
    const raw = Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_LIST_LIMIT;
    const safe = Math.min(Math.max(raw, 1), MAX_LIST_LIMIT);
    return this.prices.findRecent(safe, type);
  }

  /** Latest `limit` points for one commodity, oldest→newest, with first-vs-last direction. */
  async energyPriceTrend(
    kind: CommodityType,
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

  /**
   * Latest persisted unit price per commodity (numeric). Missing history → 0 for that key.
   */
  async getLatestCommodityUnitPrices(): Promise<Record<CommodityType, number>> {
    const latest = await this.prices.findLatestPerCommodityType();
    const out = emptyCommodityUnitPrices();
    for (const c of Object.values(CommodityType) as CommodityType[]) {
      const row = latest.get(c);
      if (!row) {
        continue;
      }
      const n = Number(row.value);
      out[c] = Number.isFinite(n) ? n : 0;
    }
    return out;
  }

  /** Simulation / scheduler: pull quotes and append history. */
  async ingestionTick(): Promise<void> {
    const batch = await this.quotes.fetchQuotes();
    for (const q of batch) {
      const row = await this.prices.insert({
        type: q.type,
        value: q.value,
        timestamp: q.at,
      });
      await this.realtime.publish(
        new EnergyPriceRecordedRealtimeEvent(
          row.timestamp,
          row.id,
          row.type,
          row.value,
        ),
      );
    }
  }
}
