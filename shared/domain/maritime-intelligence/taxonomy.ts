export const VesselType = {
  CRUDE_TANKER: 'CRUDE_TANKER',
  LNG_CARRIER: 'LNG_CARRIER',
  LPG_CARRIER: 'LPG_CARRIER',
  PRODUCT_TANKER: 'PRODUCT_TANKER',
  CHEMICAL_TANKER: 'CHEMICAL_TANKER',
  CONTAINER: 'CONTAINER',
  BULK: 'BULK',
} as const;

export type VesselType = (typeof VesselType)[keyof typeof VesselType];

export const CargoType = {
  CRUDE_OIL: 'CRUDE_OIL',
  LNG: 'LNG',
  LPG: 'LPG',
  REFINED_PRODUCTS: 'REFINED_PRODUCTS',
  PETROCHEMICALS: 'PETROCHEMICALS',
  DRY_BULK: 'DRY_BULK',
  CONTAINER_GOODS: 'CONTAINER_GOODS',
} as const;

export type CargoType = (typeof CargoType)[keyof typeof CargoType];

export const DEFAULT_CARGO_BY_VESSEL: Record<VesselType, CargoType> = {
  [VesselType.CRUDE_TANKER]: CargoType.CRUDE_OIL,
  [VesselType.LNG_CARRIER]: CargoType.LNG,
  [VesselType.LPG_CARRIER]: CargoType.LPG,
  [VesselType.PRODUCT_TANKER]: CargoType.REFINED_PRODUCTS,
  [VesselType.CHEMICAL_TANKER]: CargoType.PETROCHEMICALS,
  [VesselType.CONTAINER]: CargoType.CONTAINER_GOODS,
  [VesselType.BULK]: CargoType.DRY_BULK,
};

export function vesselTypeToDefaultCargo(vesselType: VesselType): CargoType {
  return DEFAULT_CARGO_BY_VESSEL[vesselType];
}

