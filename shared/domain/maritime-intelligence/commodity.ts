import type { ShipCargoType } from './legacy-shipping';

/** Trade / cargo commodity (distinct from vessel category {@link ShipCargoType}). */
export enum CommodityType {
  OIL = 'OIL',
  LNG = 'LNG',
  LPG = 'LPG',
  REFINED_PRODUCTS = 'REFINED_PRODUCTS',
  PETROCHEMICALS = 'PETROCHEMICALS',
  CONTAINER = 'CONTAINER',
  BULK = 'BULK',
}

const COMMODITY_VALUES = new Set<string>(Object.values(CommodityType));

/** Volume proxy factor from declared capacity until real stowage data exists. */
const CARGO_VOLUME_FACTOR = 0.72;

export function isCommodityType(value: string): value is CommodityType {
  return COMMODITY_VALUES.has(value);
}

/**
 * Estimated cargo volume from declared capacity (same unit as capacity input).
 * @throws if capacity is not a finite non-negative number
 */
export function estimateCargoVolume(capacity: number): number {
  if (!Number.isFinite(capacity) || capacity < 0) {
    throw new Error(
      'estimateCargoVolume: capacity must be a non-negative finite number',
    );
  }
  return capacity * CARGO_VOLUME_FACTOR;
}

/**
 * Maps legacy vessel cargo category to a commodity (one-to-one, deterministic).
 */
export function commodityFromShipCargoType(cargo: ShipCargoType): CommodityType {
  switch (cargo) {
    case 'LNG':
      return CommodityType.LNG;
    case 'CONTAINER':
      return CommodityType.CONTAINER;
    case 'BULK':
      return CommodityType.BULK;
    case 'OIL':
      return CommodityType.OIL;
    case 'OTHER':
      return CommodityType.PETROCHEMICALS;
  }
}
