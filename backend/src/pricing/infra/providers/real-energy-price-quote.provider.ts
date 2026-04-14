import { Injectable } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import type {
  EnergyPriceQuote,
  EnergyPriceQuoteProviderPort,
} from '../../application/energy-price-quote.provider.port';
import { MarketSignal } from '../../domain/market-signal';
import { mapMarketSignalToCommodity } from '../../domain/market-signal.mapper';

/**
 * Placeholder “real” quotes: static per-signal prices, mapped to commodities.
 * Colliding commodities take the first signal in enum order (BRENT beats WTI for OIL, etc.).
 */
const STATIC_PRICE_BY_SIGNAL: Record<MarketSignal, number> = {
  [MarketSignal.BRENT_CRUDE]: 80,
  [MarketSignal.WTI_CRUDE]: 79,
  [MarketSignal.HENRY_HUB_GAS]: 12,
  [MarketSignal.TTF_GAS]: 11.5,
  [MarketSignal.LPG_INDEX]: 10,
  [MarketSignal.NAPHTHA]: 65,
  [MarketSignal.FREIGHT_CONTAINER_INDEX]: 3000,
  [MarketSignal.DRY_BULK_INDEX]: 25,
};

const REFINED_PRODUCTS_FALLBACK = 70;

@Injectable()
export class RealEnergyPriceQuoteProvider implements EnergyPriceQuoteProviderPort {
  async fetchQuotes(): Promise<readonly EnergyPriceQuote[]> {
    const at = new Date();
    const byCommodity = new Map<CommodityType, EnergyPriceQuote>();

    for (const signal of Object.values(MarketSignal) as MarketSignal[]) {
      const type = mapMarketSignalToCommodity(signal);
      if (byCommodity.has(type)) {
        continue;
      }
      const price = STATIC_PRICE_BY_SIGNAL[signal];
      byCommodity.set(type, {
        type,
        value: price.toFixed(4),
        at,
        signal,
      });
    }

    if (!byCommodity.has(CommodityType.REFINED_PRODUCTS)) {
      byCommodity.set(CommodityType.REFINED_PRODUCTS, {
        type: CommodityType.REFINED_PRODUCTS,
        value: REFINED_PRODUCTS_FALLBACK.toFixed(4),
        at,
      });
    }

    const order = Object.values(CommodityType) as CommodityType[];
    return order.map((c) => byCommodity.get(c)).filter((q): q is EnergyPriceQuote => q !== undefined);
  }
}
