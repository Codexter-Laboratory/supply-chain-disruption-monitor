import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  SupplyChainEventRepositoryPort,
  type NewSupplyChainEventRecord,
} from '../application/supply-chain-event.repository.port';
import type { SupplyChainEvent } from '../domain/supply-chain-event.entity';
import {
  supplyChainEventFromPrismaRow,
  supplyChainEventKindToPrisma,
} from './supply-chain-event.prisma-mapper';

@Injectable()
export class PrismaSupplyChainEventRepository
  implements SupplyChainEventRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SupplyChainEvent | null> {
    const row = await this.prisma.supplyChainEvent.findUnique({
      where: { id },
    });
    return row ? supplyChainEventFromPrismaRow(row) : null;
  }

  async findRecentForShip(
    shipId: string,
    limit: number,
  ): Promise<readonly SupplyChainEvent[]> {
    const rows = await this.prisma.supplyChainEvent.findMany({
      where: { shipId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows.map(supplyChainEventFromPrismaRow);
  }

  async insert(record: NewSupplyChainEventRecord): Promise<SupplyChainEvent> {
    const row = await this.prisma.supplyChainEvent.create({
      data: {
        shipId: record.shipId,
        routeLegId: record.routeLegId,
        type: supplyChainEventKindToPrisma(record.type),
        timestamp: record.timestamp,
        description: record.description,
      },
    });
    return supplyChainEventFromPrismaRow(row);
  }
}
