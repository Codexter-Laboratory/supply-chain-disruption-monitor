export type { ShipCargoType, ShipOperationalStatus } from './legacy-shipping';

export {
  CargoType,
  DEFAULT_CARGO_BY_VESSEL,
  VesselType,
  vesselTypeToDefaultCargo,
} from './taxonomy';

export type {
  ClassifiedMaritimeShip,
  EstimatedCapacity,
  ShipClassificationInput,
  ShipClassificationSource,
} from './types';
export type { CapacityUnit } from './types';

export {
  classifyVessel,
  estimateCargoVolume,
  isShipDelayed,
  toShipClassificationInput,
} from './classification';
