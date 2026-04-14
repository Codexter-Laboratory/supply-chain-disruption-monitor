import { Injectable } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import type {
  EnergyPriceQuote,
  EnergyPriceQuoteProviderPort,
} from '../../application/energy-price-quote.provider.port';
import { MarketSignal } from '../../domain/market-signal';

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

function representativeMarketSignalForCommodity(
  type: CommodityType,
): MarketSignal | undefined {
  switch (type) {
    case CommodityType.OIL:
      return MarketSignal.BRENT_CRUDE;
    case CommodityType.LNG:
      return MarketSignal.HENRY_HUB_GAS;
    case CommodityType.LPG:
      return MarketSignal.LPG_INDEX;
    case CommodityType.PETROCHEMICALS:
      return MarketSignal.NAPHTHA;
    case CommodityType.CONTAINER:
      return MarketSignal.FREIGHT_CONTAINER_INDEX;
    case CommodityType.BULK:
      return MarketSignal.DRY_BULK_INDEX;
    case CommodityType.REFINED_PRODUCTS:
      return undefined;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

@Injectable()
export class SimulationEnergyPriceQuoteProvider
  implements EnergyPriceQuoteProviderPort
{
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
      return {
        type,
        value: v.toFixed(4),
        at,
        signal: representativeMarketSignalForCommodity(type),
      };
    });
  }
}
