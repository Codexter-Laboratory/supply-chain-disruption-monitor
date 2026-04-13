import type { CommodityType } from '@supply-chain/maritime-intelligence';
import type { EnergyPrice } from './energy-price.entity';

export type TrendDirection = 'UP' | 'DOWN' | 'FLAT';

/** Read model: chronological window for a single commodity + coarse direction. */
export interface EnergyPriceTrend {
  readonly kind: CommodityType;
  readonly points: readonly EnergyPrice[];
  readonly simpleTrend: TrendDirection;
}
