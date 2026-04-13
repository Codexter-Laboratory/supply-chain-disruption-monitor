import type { ShipCargoType, ShipOperationalStatus } from './legacy-shipping';
import type { CargoType, VesselType } from './taxonomy';

export type CapacityUnit = 'DWT' | 'M3';

export interface EstimatedCapacity {
  readonly value: number;
  readonly unit: CapacityUnit;
}

/** Narrow input passed to classification (no geo / identity extras). */
export interface ShipClassificationInput {
  readonly id: string;
  readonly name?: string;
  readonly cargoType: ShipCargoType;
  readonly capacity: string;
  readonly currentStatus: ShipOperationalStatus;
  readonly vesselType?: VesselType | null;
  readonly domainCargoType?: CargoType | null;
  readonly delayStartTime?: string | null;
}

/**
 * Any plain object carrying classification fields: Prisma rows, GraphQL DTOs,
 * or domain aggregates. Extra keys are ignored by {@link toShipClassificationInput}.
 */
export type ShipClassificationSource = ShipClassificationInput & {
  readonly imo?: string;
  readonly latitude?: number;
  readonly longitude?: number;
};

export interface ClassifiedMaritimeShip {
  readonly id: string;
  readonly vesselType: VesselType;
  readonly cargoType: CargoType;
  readonly estimatedCapacity: EstimatedCapacity;
  readonly isDelayed: boolean;
  readonly delayStartTime: string | null;
}
