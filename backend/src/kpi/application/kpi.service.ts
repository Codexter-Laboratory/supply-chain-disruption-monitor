import { Injectable } from '@nestjs/common';
import type {
  CargoType,
  ShipClassificationSource,
} from '@supply-chain/maritime-intelligence';
import { computeKpiSnapshot } from '../domain/kpi.calculator';
import type { KpiSnapshot } from '../domain/kpi.types';

/** Placeholder benchmarks until pricing service is wired. */
const DEFAULT_MOCK_OIL_PRICE_USD_PER_BARREL = 78.5;
const DEFAULT_MOCK_LNG_PRICE_USD_PER_M3 = 12.3;

export interface KpiSnapshotOptions {
  readonly oilPricePerBarrel?: number;
  readonly lngPricePerM3?: number;
  readonly unitPriceByCargoType?: Partial<Record<CargoType, number>>;
  /** Defaults to `new Date()` when omitted. */
  readonly asOf?: Date;
}

/**
 * Application orchestration: load ships (future: repository), attach prices, run pure calculator.
 */
@Injectable()
export class KpiService {
  buildSnapshot(
    ships: readonly ShipClassificationSource[],
    options: KpiSnapshotOptions = {},
  ): KpiSnapshot {
    const oilPricePerBarrel =
      options.oilPricePerBarrel ?? DEFAULT_MOCK_OIL_PRICE_USD_PER_BARREL;
    const lngPricePerM3 =
      options.lngPricePerM3 ?? DEFAULT_MOCK_LNG_PRICE_USD_PER_M3;
    const asOf = options.asOf ?? new Date();

    return computeKpiSnapshot({
      ships,
      oilPricePerBarrel,
      lngPricePerM3,
      unitPriceByCargoType: options.unitPriceByCargoType,
      asOf,
    });
  }
}
