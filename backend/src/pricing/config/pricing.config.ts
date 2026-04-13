export type PricingMode = 'simulation' | 'real';

/**
 * How quote ingestion chooses its provider (see {@link createEnergyPriceQuoteProvider}).
 * Defaults to `simulation` when unset or invalid.
 */
export function getPricingMode(): PricingMode {
  const raw = process.env.PRICING_MODE?.trim().toLowerCase();
  if (raw === 'real') {
    return 'real';
  }
  return 'simulation';
}
