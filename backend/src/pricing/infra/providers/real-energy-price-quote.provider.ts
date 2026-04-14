import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import type {
  EnergyPriceQuote,
  EnergyPriceQuoteProviderPort,
} from '../../application/energy-price-quote.provider.port';
import {
  EXTERNAL_PRICING_API,
  type ExternalPricingApiPort,
} from '../../application/external-pricing-api.port';
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

/** Maps commodity keys to keys expected in {@link ExternalPricingApiPort} responses (OIL only wired). */
const EXTERNAL_SYMBOL_MAP: Record<string, string> = {
  OIL: 'BRENT',
  LNG: 'TTF',
  CONTAINER: 'SCFI',
};

/** Fallback when external OIL price is missing or invalid (matches first OIL signal in loop). */
const EXISTING_STATIC_OIL_PRICE = STATIC_PRICE_BY_SIGNAL[MarketSignal.BRENT_CRUDE];

@Injectable()
export class RealEnergyPriceQuoteProvider implements EnergyPriceQuoteProviderPort {
  private readonly logger = new Logger(RealEnergyPriceQuoteProvider.name);

  constructor(
    @Inject(EXTERNAL_PRICING_API)
    private readonly externalApi: ExternalPricingApiPort,
  ) {}

  async fetchQuotes(): Promise<readonly EnergyPriceQuote[]> {
    let externalPrices: Record<string, number> | null = null;
    try {
      externalPrices = await this.externalApi.fetchLatestPrices();
    } catch {
      externalPrices = null;
    }

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

    const oilSymbol = EXTERNAL_SYMBOL_MAP['OIL'];
    const externalOilPrice = externalPrices?.[oilSymbol];
    const oilPrice =
      typeof externalOilPrice === 'number' && Number.isFinite(externalOilPrice)
        ? externalOilPrice
        : EXISTING_STATIC_OIL_PRICE;

    this.logger.debug(
      `External pricing used: oil=${externalOilPrice ?? 'fallback'}`,
    );

    const oilQuote = byCommodity.get(CommodityType.OIL);
    if (oilQuote !== undefined) {
      byCommodity.set(CommodityType.OIL, {
        ...oilQuote,
        value: oilPrice.toFixed(4),
      });
    }

    const order = Object.values(CommodityType) as CommodityType[];
    return order.map((c) => byCommodity.get(c)).filter((q): q is EnergyPriceQuote => q !== undefined);
  }
}
