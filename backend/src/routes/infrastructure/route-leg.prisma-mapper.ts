import { ShipRouteLeg as PrismaRouteLeg } from '@prisma/client';
import { RouteLeg } from '../domain/route-leg.entity';

export function routeLegFromPrisma(row: PrismaRouteLeg): RouteLeg {
  return {
    id: row.id,
    shipId: row.shipId,
    originPort: row.originPort,
    destinationPort: row.destinationPort,
    departureDate: row.departureDate,
    estimatedArrival: row.estimatedArrival,
    openedAt: row.openedAt,
    closedAt: row.closedAt,
    sequence: row.sequence,
  };
}
