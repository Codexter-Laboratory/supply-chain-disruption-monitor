import { Injectable } from '@nestjs/common';
import { CommodityType } from '@supply-chain/maritime-intelligence';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  EnergyPriceRepositoryPort,
  type NewEnergyPriceRecord,
} from '../application/energy-price.repository.port';
import type { EnergyPrice } from '../domain/energy-price.entity';
import {
  domainCommodityTypeToPrisma,
  energyPriceFromPrismaRow,
} from './energy-price.prisma-mapper';

const COMMODITY_COUNT = Object.values(CommodityType).length;

@Injectable()
export class PrismaEnergyPriceRepository implements EnergyPriceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async insert(record: NewEnergyPriceRecord): Promise<EnergyPrice> {
    const row = await this.prisma.energyPrice.create({
      data: {
        type: domainCommodityTypeToPrisma(record.type),
        value: new Prisma.Decimal(record.value),
        timestamp: record.timestamp,
      },
    });
    return energyPriceFromPrismaRow(row);
  }

  async findRecent(
    limit: number,
    type?: CommodityType,
  ): Promise<readonly EnergyPrice[]> {
    const rows = await this.prisma.energyPrice.findMany({
      where:
        type !== undefined
          ? { type: domainCommodityTypeToPrisma(type) }
          : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows.map(energyPriceFromPrismaRow);
  }

  async findSeriesChronological(
    type: CommodityType,
    limit: number,
  ): Promise<readonly EnergyPrice[]> {
    const rows = await this.prisma.energyPrice.findMany({
      where: { type: domainCommodityTypeToPrisma(type) },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows.map(energyPriceFromPrismaRow).reverse();
  }

  async findLatestPerCommodityType(): Promise<
    ReadonlyMap<CommodityType, EnergyPrice>
  > {
    const rows = await this.prisma.energyPrice.findMany({
      orderBy: { timestamp: 'desc' },
      take: Math.max(200, COMMODITY_COUNT * 30),
    });
    const map = new Map<CommodityType, EnergyPrice>();
    for (const row of rows) {
      const domain = energyPriceFromPrismaRow(row);
      if (!map.has(domain.type)) {
        map.set(domain.type, domain);
      }
      if (map.size >= COMMODITY_COUNT) {
        break;
      }
    }
    return map;
  }
}
