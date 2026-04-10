import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ShipRepositoryPort } from '../application/ship.repository.port';
import type { Ship } from '../domain/ship.entity';
import type { ShipPage } from '../domain/ship-page';
import { shipFromPrismaRow } from './ship.prisma-mapper';

@Injectable()
export class PrismaShipRepository implements ShipRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Ship | null> {
    const row = await this.prisma.ship.findUnique({ where: { id } });
    return row ? shipFromPrismaRow(row) : null;
  }

  async findPage(offset: number, limit: number): Promise<ShipPage> {
    const [total, rows] = await Promise.all([
      this.prisma.ship.count(),
      this.prisma.ship.findMany({
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);
    return {
      items: rows.map(shipFromPrismaRow),
      total,
      offset,
      limit,
    };
  }
}
