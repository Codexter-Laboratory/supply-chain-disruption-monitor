import type { ShipPage } from '../domain/ship-page';
import { toShipGraphql } from './ship.dto-mapper';
import { ShipPageGraphqlType } from './ship-page.graphql-types';

export function toShipPageGraphql(page: ShipPage): ShipPageGraphqlType {
  const dto = new ShipPageGraphqlType();
  dto.items = page.items.map(toShipGraphql);
  dto.total = page.total;
  dto.offset = page.offset;
  dto.limit = page.limit;
  return dto;
}
