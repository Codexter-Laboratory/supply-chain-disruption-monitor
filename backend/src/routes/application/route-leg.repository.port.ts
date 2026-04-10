import { RouteLeg } from '../domain/route-leg.entity';

export const ROUTE_LEG_REPOSITORY = Symbol('ROUTE_LEG_REPOSITORY');

export interface RouteLegRepositoryPort {
  findHistoryForShip(shipId: string): Promise<readonly RouteLeg[]>;
}
