import type { Ship, ShipCargoType, ShipOperationalStatus } from '../domain/ship.entity';
import {
  ShipCargoTypeGql,
  ShipGraphqlType,
  ShipOperationalStatusGql,
} from './ship.graphql-types';

const cargoToGql: Record<ShipCargoType, ShipCargoTypeGql> = {
  OIL: ShipCargoTypeGql.OIL,
  LNG: ShipCargoTypeGql.LNG,
  CONTAINER: ShipCargoTypeGql.CONTAINER,
  BULK: ShipCargoTypeGql.BULK,
  OTHER: ShipCargoTypeGql.OTHER,
};

const statusToGql: Record<ShipOperationalStatus, ShipOperationalStatusGql> = {
  MOVING: ShipOperationalStatusGql.MOVING,
  WAITING: ShipOperationalStatusGql.WAITING,
  BLOCKED: ShipOperationalStatusGql.BLOCKED,
  DELAYED: ShipOperationalStatusGql.DELAYED,
};

export function toShipGraphql(ship: Ship): ShipGraphqlType {
  const dto = new ShipGraphqlType();
  dto.id = ship.id;
  dto.name = ship.name;
  dto.imo = ship.imo;
  dto.country = ship.country;
  dto.cargoType = cargoToGql[ship.cargoType];
  dto.capacity = ship.capacity;
  dto.currentStatus = statusToGql[ship.currentStatus];
  return dto;
}
