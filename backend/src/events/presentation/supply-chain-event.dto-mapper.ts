import type { SupplyChainEvent, SupplyChainEventKind } from '../domain/supply-chain-event.entity';
import {
  SupplyChainEventGraphqlType,
  SupplyChainEventKindGql,
} from './supply-chain-event.graphql-types';

const kindToGql: Record<SupplyChainEventKind, SupplyChainEventKindGql> = {
  DELAY: SupplyChainEventKindGql.DELAY,
  INCIDENT: SupplyChainEventKindGql.INCIDENT,
  REROUTE: SupplyChainEventKindGql.REROUTE,
  CLEARANCE: SupplyChainEventKindGql.CLEARANCE,
};

export function toSupplyChainEventGraphql(
  event: SupplyChainEvent,
): SupplyChainEventGraphqlType {
  const dto = new SupplyChainEventGraphqlType();
  dto.id = event.id;
  dto.shipId = event.shipId;
  dto.routeLegId = event.routeLegId;
  dto.type = kindToGql[event.type];
  dto.timestamp = event.timestamp;
  dto.description = event.description;
  return dto;
}
