import { Inject, Injectable } from '@nestjs/common';
import {
  ROUTE_LEG_REPOSITORY,
  RouteLegRepositoryPort,
} from './route-leg.repository.port';
import { RouteLeg } from '../domain/route-leg.entity';

@Injectable()
export class RoutesApplicationService {
  constructor(
    @Inject(ROUTE_LEG_REPOSITORY)
    private readonly legs: RouteLegRepositoryPort,
  ) {}

  async routeHistoryForShip(shipId: string): Promise<readonly RouteLeg[]> {
    return this.legs.findHistoryForShip(shipId);
  }
}
