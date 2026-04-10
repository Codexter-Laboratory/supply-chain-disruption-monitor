import { Injectable } from '@nestjs/common';
import type {
  EnergyPriceQuote,
  EnergyPriceQuoteProviderPort,
} from '../application/energy-price-quote.provider.port';

/**
 * Deterministic pseudo-quotes for local dev / simulation ticks.
 */
@Injectable()
export class MockEnergyPriceQuoteProvider implements EnergyPriceQuoteProviderPort {
  private tick = 0;

  async fetchQuotes(): Promise<readonly EnergyPriceQuote[]> {
    this.tick += 1;
    const at = new Date();
    const oilBase = 72 + (this.tick % 7) * 0.35;
    const gasBase = 3.2 + (this.tick % 5) * 0.08;
    return [
      { type: 'OIL', value: oilBase.toFixed(4), at },
      { type: 'GAS', value: gasBase.toFixed(4), at },
    ];
  }
}
