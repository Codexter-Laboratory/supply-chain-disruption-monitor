import type { CommodityType } from '@supply-chain/maritime-intelligence';
import type { MarketSignal } from '../domain/market-signal';

export type EnergyPriceQuote = {
  readonly type: CommodityType;
  readonly value: string;
  readonly at: Date;
  /** Optional upstream benchmark / index (ignored by persistence today). */
  readonly signal?: MarketSignal;
};

export interface EnergyPriceQuoteProviderPort {
  fetchQuotes(): Promise<readonly EnergyPriceQuote[]>;
}

export const ENERGY_PRICE_QUOTE_PROVIDER = Symbol('ENERGY_PRICE_QUOTE_PROVIDER');
