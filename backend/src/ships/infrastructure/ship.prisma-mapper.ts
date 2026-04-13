import type { Ship as PrismaShipRow } from '@prisma/client';
import { CargoType, CommodityType as PrismaCommodityType, ShipStatus } from '@prisma/client';
import { CommodityType } from '@supply-chain/maritime-intelligence';
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

const prismaCommodityToDomain: Record<PrismaCommodityType, CommodityType> = {
  [PrismaCommodityType.OIL]: CommodityType.OIL,
  [PrismaCommodityType.LNG]: CommodityType.LNG,
  [PrismaCommodityType.LPG]: CommodityType.LPG,
  [PrismaCommodityType.REFINED_PRODUCTS]: CommodityType.REFINED_PRODUCTS,
  [PrismaCommodityType.PETROCHEMICALS]: CommodityType.PETROCHEMICALS,
  [PrismaCommodityType.CONTAINER]: CommodityType.CONTAINER,
  [PrismaCommodityType.BULK]: CommodityType.BULK,
};

/** Prisma row → domain entity (infrastructure only). */
export function shipFromPrismaRow(row: PrismaShipRow): Ship {
  return Ship.restore({
    id: row.id,
    name: row.name,
    imo: row.imo,
    country: row.country,
    cargoType: cargoMap[row.cargoType],
    commodity: prismaCommodityToDomain[row.commodity],
    cargoVolume: row.cargoVolume,
    capacity: row.capacity.toString(),
    currentStatus: statusMap[row.currentStatus],
    latitude: row.latitude,
    longitude: row.longitude,
    originCountry: row.originCountry,
    destinationCountry: row.destinationCountry,
    ownerCompany: row.ownerCompany,
  });
}
