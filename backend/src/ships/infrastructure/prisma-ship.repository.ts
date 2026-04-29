import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ShipRepositoryPort } from '../application/ship.repository.port';
import type { ShipGeoBoundingBox } from '../application/ship-geo-bounding-box';
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

  async findByImo(imo: string): Promise<Ship | null> {
    const row = await this.prisma.ship.findUnique({ where: { imo } });
    return row ? shipFromPrismaRow(row) : null;
  }

  async findKnownImos(): Promise<readonly string[]> {
    const rows = await this.prisma.ship.findMany({
      select: { imo: true },
      orderBy: { imo: 'asc' },
    });
    return rows.map((r) => r.imo);
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

  async findInBoundingBox(box: ShipGeoBoundingBox): Promise<readonly Ship[]> {
    const rows = await this.prisma.ship.findMany({
      where: {
        latitude: { gte: box.minLatitude, lte: box.maxLatitude },
        longitude: { gte: box.minLongitude, lte: box.maxLongitude },
      },
      orderBy: { name: 'asc' },
    });
    return rows.map(shipFromPrismaRow);
  }

  async findAllOrderedByName(): Promise<readonly Ship[]> {
    const rows = await this.prisma.ship.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(shipFromPrismaRow);
  }
}
