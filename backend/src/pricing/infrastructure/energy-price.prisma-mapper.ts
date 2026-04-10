import type { EnergyPrice as PrismaEnergyPriceRow } from '@prisma/client';
import { EnergyPriceType } from '@prisma/client';
import {
  EnergyPrice,
  type EnergyPriceKind,
} from '../domain/energy-price.entity';

const typeMap: Record<EnergyPriceType, EnergyPriceKind> = {
  OIL: 'OIL',
  GAS: 'GAS',
};

const kindToPrisma: Record<EnergyPriceKind, EnergyPriceType> = {
  OIL: EnergyPriceType.OIL,
  GAS: EnergyPriceType.GAS,
};

export function energyPriceKindToPrisma(kind: EnergyPriceKind): EnergyPriceType {
  return kindToPrisma[kind];
}

export function energyPriceFromPrismaRow(
  row: PrismaEnergyPriceRow,
): EnergyPrice {
  return EnergyPrice.restore({
    id: row.id,
    type: typeMap[row.type],
    value: row.value.toString(),
    timestamp: row.timestamp,
  });
}
