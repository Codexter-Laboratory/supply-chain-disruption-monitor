import { Injectable } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import type {
  EnergyPriceQuote,
  EnergyPriceQuoteProviderPort,
} from '../application/energy-price-quote.provider.port';

/** Deterministic simulated quotes for all commodities (simulation ticks). */
const BASE_BY_COMMODITY: Record<CommodityType, number> = {
  [CommodityType.OIL]: 80,
  [CommodityType.LNG]: 14,
  [CommodityType.LPG]: 10,
  [CommodityType.REFINED_PRODUCTS]: 65,
  [CommodityType.PETROCHEMICALS]: 55,
  [CommodityType.CONTAINER]: 2.5,
  [CommodityType.BULK]: 1.8,
};

@Injectable()
export class MockEnergyPriceQuoteProvider implements EnergyPriceQuoteProviderPort {
  private tick = 0;

  async fetchQuotes(): Promise<readonly EnergyPriceQuote[]> {
    this.tick += 1;
    const at = new Date();
    const commodities = Object.values(CommodityType) as CommodityType[];
    return commodities.map((type, idx) => {
      const base = BASE_BY_COMMODITY[type];
      const wobble =
        1 + Math.sin(this.tick * 0.27 + idx * 0.41 + type.charCodeAt(0) * 0.01) * 0.025;
      const v = base * wobble;
      return { type, value: v.toFixed(4), at };
    });
  }
}
