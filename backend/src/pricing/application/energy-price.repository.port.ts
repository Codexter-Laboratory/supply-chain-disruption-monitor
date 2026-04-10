import type { EnergyPrice, EnergyPriceKind } from '../domain/energy-price.entity';

export const ENERGY_PRICE_REPOSITORY = Symbol('ENERGY_PRICE_REPOSITORY');

export type NewEnergyPriceRecord = {
  readonly type: EnergyPriceKind;
  readonly value: string;
  readonly timestamp: Date;
};

export interface EnergyPriceRepositoryPort {
  insert(record: NewEnergyPriceRecord): Promise<EnergyPrice>;
  findRecent(
    limit: number,
    type?: EnergyPriceKind,
  ): Promise<readonly EnergyPrice[]>;
  /** Last `limit` rows for kind, oldest → newest (for trend display). */
  findSeriesChronological(
    type: EnergyPriceKind,
    limit: number,
  ): Promise<readonly EnergyPrice[]>;
}
