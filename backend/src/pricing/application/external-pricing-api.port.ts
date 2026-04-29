/**
 * Port for outbound commodity-price HTTP/API calls.
 * Wired in the pricing module (e.g. `RealPricingApiAdapter` backed by shared `HttpClientPort`).
 */
export interface ExternalPricingApiPort {
  fetchLatestPrices(): Promise<Record<string, number>>;
}

/** NestJS injection token for `ExternalPricingApiPort`. */
export const EXTERNAL_PRICING_API = Symbol('EXTERNAL_PRICING_API');
