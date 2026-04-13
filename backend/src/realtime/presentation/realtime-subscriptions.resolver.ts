import { Inject } from '@nestjs/common';
import { Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../application/pub-sub.token';
import {
  ENERGY_PRICE_UPDATED_TOPIC,
  SHIP_STATUS_CHANGED_TOPIC,
  SUPPLY_CHAIN_EVENT_CREATED_TOPIC,
} from '../application/realtime-topics';
import {
  EnergyPriceUpdatedPayloadGraphqlType,
  ShipStatusChangedPayloadGraphqlType,
  SupplyChainEventCreatedPayloadGraphqlType,
} from './realtime-events.graphql-types';

@Resolver()
export class RealtimeSubscriptionsResolver {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  @Subscription(() => ShipStatusChangedPayloadGraphqlType, {
    name: 'shipStatusChanged',
    resolve: (payload: { shipStatusChanged: ShipStatusChangedPayloadGraphqlType }) =>
      payload.shipStatusChanged,
  })
  shipStatusChanged() {
    return this.pubSub.asyncIterator(SHIP_STATUS_CHANGED_TOPIC);
  }

  @Subscription(() => SupplyChainEventCreatedPayloadGraphqlType, {
    name: 'supplyChainEventCreated',
    resolve: (payload: {
      supplyChainEventCreated: SupplyChainEventCreatedPayloadGraphqlType;
    }) => payload.supplyChainEventCreated,
  })
  supplyChainEventCreated() {
    return this.pubSub.asyncIterator(SUPPLY_CHAIN_EVENT_CREATED_TOPIC);
  }

  @Subscription(() => EnergyPriceUpdatedPayloadGraphqlType, {
    name: 'energyPriceUpdated',
    resolve: (payload: {
      energyPriceUpdated: EnergyPriceUpdatedPayloadGraphqlType;
    }) => payload.energyPriceUpdated,
  })
  energyPriceUpdated() {
    return this.pubSub.asyncIterator(ENERGY_PRICE_UPDATED_TOPIC);
  }
}
