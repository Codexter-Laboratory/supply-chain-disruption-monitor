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
  /*
   * Nullable scalars mirror an optional Coordinates value on the domain entity; the aggregate does
   * not expose raw lat/lng fields. This flattening is deliberate for GraphQL consumers only.
   */
  dto.latitude = event.position?.latitude ?? null;
  dto.longitude = event.position?.longitude ?? null;
  dto.region = event.region;
  return dto;
}
