/** Contract for fetching latest commodity prices from an external source (not wired yet). */
export interface ExternalPricingApiPort {
  fetchLatestPrices(): Promise<Record<string, number>>;
}

export const EXTERNAL_PRICING_API = Symbol('EXTERNAL_PRICING_API');
