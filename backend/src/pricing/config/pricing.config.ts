import { parseSourceMode } from '../../config/source-mode.config';

export type PricingMode = 'simulation' | 'real';

/**
 * How quote ingestion chooses its provider (`createEnergyPriceQuoteProvider` factory).
 * Uses {@link parseSourceMode}; values other than `real` (including `hybrid`) map to `simulation`
 * until the factory supports additional modes.
 */
export function getPricingMode(): PricingMode {
  const mode = parseSourceMode(process.env.PRICING_MODE, 'simulation');
  return mode === 'real' ? 'real' : 'simulation';
}
