import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  type OpenRouteLegInput,
  type ReplaceCurrentRouteLegInput,
  RouteLegRepositoryPort,
} from '../application/route-leg.repository.port';
import { RouteLeg } from '../domain/route-leg.entity';
import { routeLegFromPrisma } from './route-leg.prisma-mapper';

@Injectable()
export class PrismaRouteLegRepository implements RouteLegRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findHistoryForShip(shipId: string): Promise<readonly RouteLeg[]> {
    const rows = await this.prisma.shipRouteLeg.findMany({
      where: { shipId },
      orderBy: [{ sequence: 'asc' }, { openedAt: 'asc' }],
    });
    return rows.map(routeLegFromPrisma);
  }

  async findCurrentForShip(shipId: string): Promise<RouteLeg | null> {
    const row = await this.prisma.shipRouteLeg.findFirst({
      where: { shipId, closedAt: null },
      orderBy: [{ sequence: 'desc' }, { openedAt: 'desc' }],
    });
    return row ? routeLegFromPrisma(row) : null;
  }

  async findLatestSequenceForShip(shipId: string): Promise<number> {
    const row = await this.prisma.shipRouteLeg.findFirst({
      where: { shipId },
      orderBy: [{ sequence: 'desc' }],
      select: { sequence: true },
    });
    return row?.sequence ?? 0;
  }

  async openLeg(input: OpenRouteLegInput): Promise<RouteLeg> {
    const row = await this.prisma.shipRouteLeg.create({
      data: {
        shipId: input.shipId,
        originPort: input.originPort,
        destinationPort: input.destinationPort,
        departureDate: input.departureDate,
        estimatedArrival: input.estimatedArrival,
        openedAt: input.openedAt,
        sequence: input.sequence,
      },
    });
    return routeLegFromPrisma(row);
  }

  async updateEstimatedArrival(routeLegId: string, eta: Date): Promise<void> {
    await this.prisma.shipRouteLeg.update({
      where: { id: routeLegId },
      data: { estimatedArrival: eta },
    });
  }

  async closeLeg(routeLegId: string, closedAt: Date): Promise<void> {
    await this.prisma.shipRouteLeg.update({
      where: { id: routeLegId },
      data: { closedAt },
    });
  }

  async replaceCurrentLeg(input: ReplaceCurrentRouteLegInput): Promise<RouteLeg> {
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.shipRouteLeg.update({
        where: { id: input.currentRouteLegId },
        data: { closedAt: input.closeAt },
      });
      return await tx.shipRouteLeg.create({
        data: {
          shipId: input.next.shipId,
          originPort: input.next.originPort,
          destinationPort: input.next.destinationPort,
          departureDate: input.next.departureDate,
          estimatedArrival: input.next.estimatedArrival,
          openedAt: input.next.openedAt,
          sequence: input.next.sequence,
        },
      });
    });
    return routeLegFromPrisma(row);
  }
}
