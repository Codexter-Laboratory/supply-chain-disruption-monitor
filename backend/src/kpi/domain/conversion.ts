import {
  CargoType,
  type EstimatedCapacity,
} from '@supply-chain/maritime-intelligence';

/**
 * Assumption: DWT in metric tonnes → barrels, for cargoes that trade in barrels.
 * Lives in conversion layer only (not scattered in calculators).
 */
export const BARRELS_PER_METRIC_TON_ASSUMPTION = 7.2 as const;

const CARGO_TYPES_VALUED_AS_BARRELS_FROM_DWT: ReadonlySet<CargoType> =
  new Set([CargoType.CRUDE_OIL, CargoType.REFINED_PRODUCTS]);

/**
 * DWT interpreted as cargo tonnes → barrels when the cargo type uses barrel economics; else 0.
 */
export function convertDwtToBarrels(
  cargoType: CargoType,
  dwt: number,
): number {
  if (!Number.isFinite(dwt) || dwt < 0) {
    return 0;
  }
  if (!CARGO_TYPES_VALUED_AS_BARRELS_FROM_DWT.has(cargoType)) {
    return 0;
  }
  return dwt * BARRELS_PER_METRIC_TON_ASSUMPTION;
}

/**
 * Cubic-metre cargo × unit price (price semantics are caller-defined per cargo).
 */
export function convertM3ToValue(
  _cargoType: CargoType,
  m3: number,
  price: number,
): number {
  if (!Number.isFinite(m3) || m3 < 0 || !Number.isFinite(price)) {
    return 0;
  }
  return m3 * price;
}

export interface EffectiveCargoPriceInput {
  readonly oilPricePerBarrel: number;
  readonly lngPricePerM3: number;
  readonly unitPriceByCargoType?: Partial<Record<CargoType, number>>;
}

/**
 * Merges optional per-cargo overrides with legacy oil/LNG benchmarks (backward compatible).
 */
export function effectiveCargoUnitPrices(
  input: EffectiveCargoPriceInput,
): Partial<Record<CargoType, number>> {
  const merged: Partial<Record<CargoType, number>> = {
    ...(input.unitPriceByCargoType ?? {}),
  };
  if (merged[CargoType.CRUDE_OIL] === undefined) {
    merged[CargoType.CRUDE_OIL] = input.oilPricePerBarrel;
  }
  if (merged[CargoType.REFINED_PRODUCTS] === undefined) {
    merged[CargoType.REFINED_PRODUCTS] = input.oilPricePerBarrel;
  }
  if (merged[CargoType.LNG] === undefined) {
    merged[CargoType.LNG] = input.lngPricePerM3;
  }
  return merged;
}

/**
 * Financial notion of cargo value from classified capacity and per-cargo unit prices.
 * DWT: barrels × price when {@link convertDwtToBarrels} is non-zero; otherwise DWT × price ($/tonne).
 * M³: {@link convertM3ToValue}.
 */
/**
 * Legacy maritime KPI: LNG domain cargo reported in m³ (other units contribute 0 here).
 */
export function lngCargoVolumeM3(
  cargoType: CargoType,
  capacity: EstimatedCapacity,
): number {
  if (cargoType !== CargoType.LNG || capacity.unit !== 'M3') {
    return 0;
  }
  return capacity.value;
}

/** Legacy financial subtotals (same composition as pre–commodity-agnostic KPIs). */
export function legacyOilBucketValue(
  valueByCargoType: Record<CargoType, number>,
): number {
  return (
    valueByCargoType[CargoType.CRUDE_OIL] +
    valueByCargoType[CargoType.REFINED_PRODUCTS]
  );
}

export function legacyLngLineValue(
  valueByCargoType: Record<CargoType, number>,
): number {
  return valueByCargoType[CargoType.LNG];
}

export function financialValueForCargo(
  cargoType: CargoType,
  capacity: EstimatedCapacity,
  unitPriceByCargo: Partial<Record<CargoType, number>>,
): number {
  const unitPrice = unitPriceByCargo[cargoType];
  if (unitPrice === undefined || !Number.isFinite(unitPrice)) {
    return 0;
  }

  if (capacity.unit === 'M3') {
    return convertM3ToValue(cargoType, capacity.value, unitPrice);
  }

  if (capacity.unit === 'DWT') {
    const barrels = convertDwtToBarrels(cargoType, capacity.value);
    if (barrels > 0) {
      return barrels * unitPrice;
    }
    return capacity.value * unitPrice;
  }

  return 0;
}
