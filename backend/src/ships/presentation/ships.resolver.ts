import { UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { graphqlArgsValidationPipe } from '../../common/utils/graphql-args-validation.pipe';
import { ShipApplicationService } from '../application/ship.application.service';
import { ShipGraphqlType } from './ship.graphql-types';
import { ShipPageGraphqlType } from './ship-page.graphql-types';
import {
  ShipByIdArgs,
  ShipsInBoundingBoxArgs,
  ShipsPageArgs,
} from './ship-queries.args';
import { toShipGraphql } from './ship.dto-mapper';
import { toShipPageGraphql } from './ship-page.dto-mapper';

@Resolver(() => ShipGraphqlType)
@UsePipes(graphqlArgsValidationPipe)
export class ShipsResolver {
  constructor(private readonly shipApplication: ShipApplicationService) {}

  @Query(() => ShipGraphqlType, { name: 'ship', nullable: true })
  async ship(
    @Args() args: ShipByIdArgs,
  ): Promise<ShipGraphqlType | null> {
    const domain = await this.shipApplication.findShipById(args.id);
    return domain ? toShipGraphql(domain) : null;
  }

  /**
   * Paginated fleet list. Offset/limit / `total` trade-offs are documented on domain `ShipPage`.
   */
  @Query(() => ShipPageGraphqlType, { name: 'ships' })
  async ships(@Args() args: ShipsPageArgs): Promise<ShipPageGraphqlType> {
    const page = await this.shipApplication.listShipsPage(
      args.offset,
      args.limit,
    );
    return toShipPageGraphql(page);
  }

  @Query(() => [ShipGraphqlType], { name: 'shipsInBoundingBox' })
  async shipsInBoundingBox(
    @Args() args: ShipsInBoundingBoxArgs,
  ): Promise<ShipGraphqlType[]> {
    const ships = await this.shipApplication.findShipsInBoundingBox({
      minLatitude: args.minLat,
      maxLatitude: args.maxLat,
      minLongitude: args.minLng,
      maxLongitude: args.maxLng,
    });
    return ships.map(toShipGraphql);
  }

  /** Viewport-scoped fleet (same application path as `shipsInBoundingBox`; preferred for maps). */
  @Query(() => [ShipGraphqlType], { name: 'shipsInView' })
  async shipsInView(
    @Args() args: ShipsInBoundingBoxArgs,
  ): Promise<ShipGraphqlType[]> {
    const ships = await this.shipApplication.findShipsInBoundingBox({
      minLatitude: args.minLat,
      maxLatitude: args.maxLat,
      minLongitude: args.minLng,
      maxLongitude: args.maxLng,
    });
    return ships.map(toShipGraphql);
  }
}
