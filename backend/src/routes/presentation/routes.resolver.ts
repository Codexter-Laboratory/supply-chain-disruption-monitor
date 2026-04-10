import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { RoutesApplicationService } from '../application/routes.application.service';
import { RouteLegGraphqlType } from './route-leg.graphql-types';
import { routeLegToGraphqlDto } from './route-leg.dto-mapper';

@Resolver(() => RouteLegGraphqlType)
export class RoutesResolver {
  constructor(private readonly routes: RoutesApplicationService) {}

  @Query(() => [RouteLegGraphqlType], { name: 'routeHistoryForShip' })
  async routeHistoryForShip(
    @Args('shipId', { type: () => ID }) shipId: string,
  ): Promise<RouteLegGraphqlType[]> {
    const legs = await this.routes.routeHistoryForShip(shipId);
    return legs.map(routeLegToGraphqlDto);
  }
}
