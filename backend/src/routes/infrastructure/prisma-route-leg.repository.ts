import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RouteLegRepositoryPort } from '../application/route-leg.repository.port';
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
}
