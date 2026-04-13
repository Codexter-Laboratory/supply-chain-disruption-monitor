import type { CommodityType } from '@supply-chain/maritime-intelligence';
import type { EnergyPrice } from '../domain/energy-price.entity';

export const ENERGY_PRICE_REPOSITORY = Symbol('ENERGY_PRICE_REPOSITORY');

export type NewEnergyPriceRecord = {
  readonly type: CommodityType;
  readonly value: string;
  readonly timestamp: Date;
};

export interface EnergyPriceRepositoryPort {
  insert(record: NewEnergyPriceRecord): Promise<EnergyPrice>;
  findRecent(
    limit: number,
    type?: CommodityType,
  ): Promise<readonly EnergyPrice[]>;
  /** Last `limit` rows for commodity, oldest → newest (for trend display). */
  findSeriesChronological(
    type: CommodityType,
    limit: number,
  ): Promise<readonly EnergyPrice[]>;
  /**
   * Latest row per {@link CommodityType} from recent history (newest timestamps first).
   */
  findLatestPerCommodityType(): Promise<ReadonlyMap<CommodityType, EnergyPrice>>;
}
