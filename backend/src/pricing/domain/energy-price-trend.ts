import type { EnergyPrice, EnergyPriceKind } from './energy-price.entity';

export type TrendDirection = 'UP' | 'DOWN' | 'FLAT';

/** Read model: chronological window for a single kind + coarse direction. */
export interface EnergyPriceTrend {
  readonly kind: EnergyPriceKind;
  readonly points: readonly EnergyPrice[];
  readonly simpleTrend: TrendDirection;
}
