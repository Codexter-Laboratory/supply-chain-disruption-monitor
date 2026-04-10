import type { SupplyChainEvent as PrismaSupplyChainEventRow } from '@prisma/client';
import { SupplyChainEventType } from '@prisma/client';
import {
  SupplyChainEvent,
  type SupplyChainEventKind,
} from '../domain/supply-chain-event.entity';

const typeMap: Record<SupplyChainEventType, SupplyChainEventKind> = {
  DELAY: 'DELAY',
  INCIDENT: 'INCIDENT',
  REROUTE: 'REROUTE',
  CLEARANCE: 'CLEARANCE',
};

const kindToPrisma: Record<SupplyChainEventKind, SupplyChainEventType> = {
  DELAY: SupplyChainEventType.DELAY,
  INCIDENT: SupplyChainEventType.INCIDENT,
  REROUTE: SupplyChainEventType.REROUTE,
  CLEARANCE: SupplyChainEventType.CLEARANCE,
};

export function supplyChainEventKindToPrisma(
  kind: SupplyChainEventKind,
): SupplyChainEventType {
  return kindToPrisma[kind];
}

/** Prisma row → domain entity (infrastructure only). */
export function supplyChainEventFromPrismaRow(
  row: PrismaSupplyChainEventRow,
): SupplyChainEvent {
  return SupplyChainEvent.restore({
    id: row.id,
    shipId: row.shipId,
    routeLegId: row.routeLegId,
    type: typeMap[row.type],
    timestamp: row.timestamp,
    description: row.description,
  });
}
