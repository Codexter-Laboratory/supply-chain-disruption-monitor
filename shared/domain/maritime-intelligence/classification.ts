import type { ShipCargoType } from './legacy-shipping';
import {
  CargoType as CargoTypeMembers,
  DEFAULT_CARGO_BY_VESSEL,
  VesselType as VesselTypeMembers,
} from './taxonomy';
import type { CargoType, VesselType } from './taxonomy';
import type {
  ClassifiedMaritimeShip,
  EstimatedCapacity,
  ShipClassificationInput,
  ShipClassificationSource,
} from './types';

const LEGACY_CARGO_TO_VESSEL: Record<ShipCargoType, VesselType> = {
  OIL: VesselTypeMembers.CRUDE_TANKER,
  LNG: VesselTypeMembers.LNG_CARRIER,
  CONTAINER: VesselTypeMembers.CONTAINER,
  BULK: VesselTypeMembers.BULK,
  OTHER: VesselTypeMembers.PRODUCT_TANKER,
};

const LEGACY_CARGO_TO_DOMAIN: Record<ShipCargoType, CargoType> = {
  OIL: CargoTypeMembers.CRUDE_OIL,
  LNG: CargoTypeMembers.LNG,
  CONTAINER: CargoTypeMembers.CONTAINER_GOODS,
  BULK: CargoTypeMembers.DRY_BULK,
  OTHER: CargoTypeMembers.REFINED_PRODUCTS,
};

const LNG_FAMILY: ReadonlySet<VesselType> = new Set([
  VesselTypeMembers.LNG_CARRIER,
  VesselTypeMembers.LPG_CARRIER,
]);

function parseCapacityNumeric(capacity: string): number {
  const n = Number.parseFloat(capacity.trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function toShipClassificationInput(
  source: ShipClassificationSource,
): ShipClassificationInput {
  return {
    id: source.id,
    name: source.name,
    cargoType: source.cargoType,
    capacity: source.capacity,
    currentStatus: source.currentStatus,
    vesselType: source.vesselType,
    domainCargoType: source.domainCargoType,
    delayStartTime: source.delayStartTime,
  };
}

function resolveVesselType(input: ShipClassificationInput): VesselType {
  if (input.vesselType) {
    return input.vesselType;
  }
  return LEGACY_CARGO_TO_VESSEL[input.cargoType];
}

function resolveDomainCargo(
  input: ShipClassificationInput,
  vesselType: VesselType,
): CargoType {
  if (input.domainCargoType) {
    return input.domainCargoType;
  }
  const fromVessel = DEFAULT_CARGO_BY_VESSEL[vesselType];
  const fromLegacy = LEGACY_CARGO_TO_DOMAIN[input.cargoType];
  if (fromVessel === fromLegacy) {
    return fromVessel;
  }
  if (input.cargoType === 'OTHER') {
    return fromVessel;
  }
  return fromLegacy;
}

function estimateCargoVolumeFromInput(
  input: ShipClassificationInput,
  vesselType: VesselType,
): EstimatedCapacity {
  const value = parseCapacityNumeric(input.capacity);
  const unit = LNG_FAMILY.has(vesselType) ? 'M3' : 'DWT';
  return { value, unit };
}

function isShipDelayedFromInput(
  input: Pick<ShipClassificationInput, 'currentStatus'>,
): boolean {
  return input.currentStatus === 'DELAYED';
}

function classifyFromInput(input: ShipClassificationInput): ClassifiedMaritimeShip {
  const vesselType = resolveVesselType(input);
  const cargoType = resolveDomainCargo(input, vesselType);
  return {
    id: input.id,
    vesselType,
    cargoType,
    estimatedCapacity: estimateCargoVolumeFromInput(input, vesselType),
    isDelayed: isShipDelayedFromInput(input),
    delayStartTime: input.delayStartTime ?? null,
  };
}

export function classifyVessel(
  source: ShipClassificationSource,
): ClassifiedMaritimeShip {
  return classifyFromInput(toShipClassificationInput(source));
}

/** Estimated capacity (value + unit) from a ship-like classification source. */
export function estimateMaritimeCapacity(
  source: ShipClassificationSource,
  vesselTypeOverride?: VesselType,
): EstimatedCapacity {
  const input = toShipClassificationInput(source);
  const vessel = vesselTypeOverride ?? resolveVesselType(input);
  return estimateCargoVolumeFromInput(input, vessel);
}

export function isShipDelayed(
  source: Pick<ShipClassificationSource, 'currentStatus'>,
): boolean {
  return source.currentStatus === 'DELAYED';
}
