import { RouteLeg } from '../domain/route-leg.entity';
import { RouteLegGraphqlType } from './route-leg.graphql-types';

export function routeLegToGraphqlDto(leg: RouteLeg): RouteLegGraphqlType {
  const dto = new RouteLegGraphqlType();
  dto.id = leg.id;
  dto.shipId = leg.shipId;
  dto.originPort = leg.originPort;
  dto.destinationPort = leg.destinationPort;
  dto.departureDate = leg.departureDate;
  dto.estimatedArrival = leg.estimatedArrival;
  dto.openedAt = leg.openedAt;
  dto.closedAt = leg.closedAt;
  dto.sequence = leg.sequence;
  return dto;
}
