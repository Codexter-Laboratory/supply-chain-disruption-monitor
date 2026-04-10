import { UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { graphqlArgsValidationPipe } from '../../common/utils/graphql-args-validation.pipe';
import { EventsApplicationService } from '../application/events.application.service';
import { SupplyChainEventGraphqlType } from './supply-chain-event.graphql-types';
import {
  RecentSupplyChainEventsArgs,
  SupplyChainEventByIdArgs,
} from './event-queries.args';
import { toSupplyChainEventGraphql } from './supply-chain-event.dto-mapper';

@Resolver(() => SupplyChainEventGraphqlType)
@UsePipes(graphqlArgsValidationPipe)
export class EventsResolver {
  constructor(private readonly events: EventsApplicationService) {}

  @Query(() => SupplyChainEventGraphqlType, {
    name: 'supplyChainEvent',
    nullable: true,
  })
  async supplyChainEvent(
    @Args() args: SupplyChainEventByIdArgs,
  ): Promise<SupplyChainEventGraphqlType | null> {
    const domain = await this.events.findSupplyChainEventById(args.id);
    return domain ? toSupplyChainEventGraphql(domain) : null;
  }

  @Query(() => [SupplyChainEventGraphqlType], {
    name: 'recentSupplyChainEvents',
  })
  async recentSupplyChainEvents(
    @Args() args: RecentSupplyChainEventsArgs,
  ): Promise<SupplyChainEventGraphqlType[]> {
    const list = await this.events.recentEventsForShip(
      args.shipId,
      args.limit,
    );
    return list.map(toSupplyChainEventGraphql);
  }
}
