import { CommodityType } from '@supply-chain/maritime-intelligence';
import { MarketSignal } from './market-signal';

export function mapMarketSignalToCommodity(signal: MarketSignal): CommodityType {
  switch (signal) {
    case MarketSignal.BRENT_CRUDE:
    case MarketSignal.WTI_CRUDE:
      return CommodityType.OIL;
    case MarketSignal.HENRY_HUB_GAS:
    case MarketSignal.TTF_GAS:
      return CommodityType.LNG;
    case MarketSignal.LPG_INDEX:
      return CommodityType.LPG;
    case MarketSignal.NAPHTHA:
      return CommodityType.PETROCHEMICALS;
    case MarketSignal.FREIGHT_CONTAINER_INDEX:
      return CommodityType.CONTAINER;
    case MarketSignal.DRY_BULK_INDEX:
      return CommodityType.BULK;
  }
  throw new Error(`Unknown market signal: ${String(signal)}`);
}
