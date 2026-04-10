import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  EnergyPriceRepositoryPort,
  type NewEnergyPriceRecord,
} from '../application/energy-price.repository.port';
import type { EnergyPrice, EnergyPriceKind } from '../domain/energy-price.entity';
import {
  energyPriceFromPrismaRow,
  energyPriceKindToPrisma,
} from './energy-price.prisma-mapper';

@Injectable()
export class PrismaEnergyPriceRepository implements EnergyPriceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async insert(record: NewEnergyPriceRecord): Promise<EnergyPrice> {
    const row = await this.prisma.energyPrice.create({
      data: {
        type: energyPriceKindToPrisma(record.type),
        value: new Prisma.Decimal(record.value),
        timestamp: record.timestamp,
      },
    });
    return energyPriceFromPrismaRow(row);
  }

  async findRecent(
    limit: number,
    type?: EnergyPriceKind,
  ): Promise<readonly EnergyPrice[]> {
    const rows = await this.prisma.energyPrice.findMany({
      where: type ? { type: energyPriceKindToPrisma(type) } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows.map(energyPriceFromPrismaRow);
  }

  async findSeriesChronological(
    type: EnergyPriceKind,
    limit: number,
  ): Promise<readonly EnergyPrice[]> {
    const rows = await this.prisma.energyPrice.findMany({
      where: { type: energyPriceKindToPrisma(type) },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows.map(energyPriceFromPrismaRow).reverse();
  }
}
