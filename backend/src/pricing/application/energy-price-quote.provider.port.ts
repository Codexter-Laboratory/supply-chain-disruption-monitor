import type { EnergyPriceKind } from '../domain/energy-price.entity';

export const ENERGY_PRICE_QUOTE_PROVIDER = Symbol('ENERGY_PRICE_QUOTE_PROVIDER');

export type EnergyPriceQuote = {
  readonly type: EnergyPriceKind;
  readonly value: string;
  readonly at: Date;
};

/** External quote source; mock in dev, HTTP client later. */
export interface EnergyPriceQuoteProviderPort {
  fetchQuotes(): Promise<readonly EnergyPriceQuote[]>;
}
