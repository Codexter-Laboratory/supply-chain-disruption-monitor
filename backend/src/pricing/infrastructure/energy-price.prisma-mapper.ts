import type { EnergyPrice as PrismaEnergyPriceRow } from '@prisma/client';
import { CommodityType as PrismaCommodityType } from '@prisma/client';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import { EnergyPrice } from '../domain/energy-price.entity';

const prismaCommodityToDomain: Record<PrismaCommodityType, CommodityType> = {
  [PrismaCommodityType.OIL]: CommodityType.OIL,
  [PrismaCommodityType.LNG]: CommodityType.LNG,
  [PrismaCommodityType.LPG]: CommodityType.LPG,
  [PrismaCommodityType.REFINED_PRODUCTS]: CommodityType.REFINED_PRODUCTS,
  [PrismaCommodityType.PETROCHEMICALS]: CommodityType.PETROCHEMICALS,
  [PrismaCommodityType.CONTAINER]: CommodityType.CONTAINER,
  [PrismaCommodityType.BULK]: CommodityType.BULK,
};

const domainCommodityToPrisma: Record<CommodityType, PrismaCommodityType> = {
  [CommodityType.OIL]: PrismaCommodityType.OIL,
  [CommodityType.LNG]: PrismaCommodityType.LNG,
  [CommodityType.LPG]: PrismaCommodityType.LPG,
  [CommodityType.REFINED_PRODUCTS]: PrismaCommodityType.REFINED_PRODUCTS,
  [CommodityType.PETROCHEMICALS]: PrismaCommodityType.PETROCHEMICALS,
  [CommodityType.CONTAINER]: PrismaCommodityType.CONTAINER,
  [CommodityType.BULK]: PrismaCommodityType.BULK,
};

export function domainCommodityTypeToPrisma(
  kind: CommodityType,
): PrismaCommodityType {
  return domainCommodityToPrisma[kind];
}

export function energyPriceFromPrismaRow(row: PrismaEnergyPriceRow): EnergyPrice {
  return EnergyPrice.restore({
    id: row.id,
    type: prismaCommodityToDomain[row.type],
    value: row.value.toString(),
    timestamp: row.timestamp,
  });
}
