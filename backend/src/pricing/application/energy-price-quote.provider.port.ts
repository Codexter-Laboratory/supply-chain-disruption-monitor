import type { CommodityType } from '@supply-chain/maritime-intelligence';

export type EnergyPriceQuote = {
  readonly type: CommodityType;
  readonly value: string;
  readonly at: Date;
};

export interface EnergyPriceQuoteProviderPort {
  fetchQuotes(): Promise<readonly EnergyPriceQuote[]>;
}

export const ENERGY_PRICE_QUOTE_PROVIDER = Symbol('ENERGY_PRICE_QUOTE_PROVIDER');
