import { Injectable } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import type {
  EnergyPriceQuote,
  EnergyPriceQuoteProviderPort,
} from '../../application/energy-price-quote.provider.port';

/**
 * Placeholder “real” quotes: static bases only (no network, no randomness).
 * Replace with external provider integration when ready.
 */
const STATIC_QUOTE_BY_COMMODITY: Record<CommodityType, number> = {
  [CommodityType.OIL]: 80,
  [CommodityType.LNG]: 12,
  [CommodityType.LPG]: 10,
  [CommodityType.REFINED_PRODUCTS]: 70,
  [CommodityType.PETROCHEMICALS]: 65,
  [CommodityType.CONTAINER]: 3000,
  [CommodityType.BULK]: 25,
};

@Injectable()
export class RealEnergyPriceQuoteProvider implements EnergyPriceQuoteProviderPort {
  async fetchQuotes(): Promise<readonly EnergyPriceQuote[]> {
    const at = new Date();
    const commodities = Object.values(CommodityType) as CommodityType[];
    return commodities.map((type) => ({
      type,
      value: STATIC_QUOTE_BY_COMMODITY[type].toFixed(4),
      at,
    }));
  }
}
