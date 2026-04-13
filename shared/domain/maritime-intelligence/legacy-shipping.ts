/** Persistence / GraphQL cargo enum (distinct from domain {@link CargoType}). */
export type ShipCargoType = 'OIL' | 'LNG' | 'CONTAINER' | 'BULK' | 'OTHER';

export type ShipOperationalStatus =
  | 'MOVING'
  | 'WAITING'
  | 'BLOCKED'
  | 'DELAYED';
