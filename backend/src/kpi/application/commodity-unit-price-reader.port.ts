import type { CommodityType } from '@supply-chain/maritime-intelligence';

/**
 * Application port: latest commodity unit prices for KPI composition.
 * Implemented outside the KPI module (e.g. integration bridge over pricing).
 */
export interface CommodityUnitPriceReaderPort {
  getLatestCommodityUnitPrices(): Promise<Record<CommodityType, number>>;
}

export const COMMODITY_UNIT_PRICE_READER = Symbol('COMMODITY_UNIT_PRICE_READER');
