import {
  CommodityType,
  type CargoType,
  type ShipClassificationSource,
  type VesselType,
} from '@supply-chain/maritime-intelligence';

export type CommodityValueMap = Record<CommodityType, number>;

export function createEmptyCommodityMap(): CommodityValueMap {
  const initial: Partial<Record<CommodityType, number>> = {};
  for (const key of Object.values(CommodityType) as CommodityType[]) {
    initial[key] = 0;
  }
  return initial as CommodityValueMap;
}

/** Optional commodity / volume on top of {@link ShipClassificationSource} for KPI aggregation. */
export type KpiShipSource = ShipClassificationSource & {
  readonly commodity?: CommodityType;
  readonly cargoVolume?: number;
};

/** Milliseconds in one hour (time math only). */
export const MILLISECONDS_PER_HOUR = 3_600_000 as const;

export interface MaritimeKpis {
  readonly totalVessels: number;
  readonly delayedVessels: number;
  readonly vesselsByType: Record<VesselType, number>;
  readonly delayedVesselsByType: Record<VesselType, number>;
  readonly totalDeadweightTonnage: number;
  /** Sum of LNG cargo capacity in cubic metres (domain cargo LNG only). */
  readonly totalLNGVolume: number;
  /** Sum of delay hours for delayed ships with valid `delayStartTime` (invalid timestamps skipped). */
  readonly totalDelayHours: number;
  readonly averageDelayTimeHours: number;
  /** Capacity value from {@link estimateMaritimeCapacity} aggregated by domain cargo (mixed units by bucket). */
  readonly volumeByCargoType: Record<CargoType, number>;
}

export interface FinancialKpis {
  readonly estimatedOilValue: number;
  readonly estimatedLngValue: number;
  /** Sum of {@link valueByCargoType} (all priced cargoes). */
  readonly totalCargoValue: number;
  readonly valueByCargoType: Record<CargoType, number>;
}

export interface KpiSnapshot {
  readonly maritime: MaritimeKpis;
  readonly financial: FinancialKpis;
  /** ISO 8601 instant used as `asOf` for delay averaging. */
  readonly computedAt: string;
  /** Stub-priced total cargo value by {@link CommodityType} (domain-only until pricing is unified). */
  readonly totalCargoValueByCommodity: CommodityValueMap;
  readonly delayedCargoValueByCommodity: CommodityValueMap;
  readonly delayedVolumeByCommodity: CommodityValueMap;
}

export interface KpiPriceInputs {
  readonly oilPricePerBarrel: number;
  readonly lngPricePerM3: number;
  /**
   * Optional unit price per cargo type (semantics match {@link financialValueForCargo} in conversion).
   * Overrides legacy oil/LNG defaults where provided.
   */
  readonly unitPriceByCargoType?: Partial<Record<CargoType, number>>;
}

export interface KpiTimeContext {
  /** Reference instant for delay duration (delayStartTime → asOf). */
  readonly asOf: Date;
}

export interface KpiComputationInput extends KpiPriceInputs, KpiTimeContext {
  readonly ships: readonly KpiShipSource[];
}
