import { Inject, Injectable, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../application/pub-sub.token';
import { RealtimePublisherPort } from '../application/realtime-publisher.port';
import {
  SHIP_STATUS_CHANGED_TOPIC,
  SUPPLY_CHAIN_EVENT_CREATED_TOPIC,
} from '../application/realtime-topics';
import { RealtimePayload } from '../domain/realtime-payload';

/**
 * Fan-out: logs + forwards typed payloads to GraphQL PubSub (single-node).
 * Replace with Redis / NATS for multi-instance; keep mapping mechanical only.
 */
@Injectable()
export class InMemoryRealtimePublisher implements RealtimePublisherPort {
  private readonly logger = new Logger(InMemoryRealtimePublisher.name);

  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  async publish(payload: RealtimePayload): Promise<void> {
    this.logger.debug(
      `Realtime ${payload.discriminator} @ ${payload.occurredAt.toISOString()}`,
    );

    if (payload.discriminator === 'ship.status_changed') {
      await this.pubSub.publish(SHIP_STATUS_CHANGED_TOPIC, {
        shipStatusChanged: {
          occurredAt: payload.occurredAt,
          shipId: payload.shipId,
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
        },
      });
      return;
    }

    if (payload.discriminator === 'supply_chain.event_created') {
      await this.pubSub.publish(SUPPLY_CHAIN_EVENT_CREATED_TOPIC, {
        supplyChainEventCreated: {
          occurredAt: payload.occurredAt,
          eventId: payload.eventId,
          shipId: payload.shipId,
          type: payload.type,
        },
      });
      return;
    }

    this.logger.debug(`No GraphQL fan-out for ${payload.discriminator}`);
  }
}
