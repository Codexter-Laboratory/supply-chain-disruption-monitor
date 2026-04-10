import type { Ship as PrismaShipRow } from '@prisma/client';
import { CargoType, ShipStatus } from '@prisma/client';
import {
  Ship,
  type ShipCargoType,
  type ShipOperationalStatus,
} from '../domain/ship.entity';

const cargoMap: Record<CargoType, ShipCargoType> = {
  OIL: 'OIL',
  LNG: 'LNG',
  CONTAINER: 'CONTAINER',
  BULK: 'BULK',
  OTHER: 'OTHER',
};

const statusMap: Record<ShipStatus, ShipOperationalStatus> = {
  MOVING: 'MOVING',
  WAITING: 'WAITING',
  BLOCKED: 'BLOCKED',
  DELAYED: 'DELAYED',
};

/** Prisma row → domain entity (infrastructure only). */
export function shipFromPrismaRow(row: PrismaShipRow): Ship {
  return Ship.restore({
    id: row.id,
    name: row.name,
    imo: row.imo,
    country: row.country,
    cargoType: cargoMap[row.cargoType],
    capacity: row.capacity.toString(),
    currentStatus: statusMap[row.currentStatus],
    latitude: row.latitude,
    longitude: row.longitude,
    originCountry: row.originCountry,
    destinationCountry: row.destinationCountry,
    ownerCompany: row.ownerCompany,
  });
}
