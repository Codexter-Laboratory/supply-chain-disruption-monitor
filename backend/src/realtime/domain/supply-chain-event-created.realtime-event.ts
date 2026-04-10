import type { SupplyChainEventKind } from '../../events/domain/supply-chain-event.entity';
import { RealtimeEventBase } from './realtime-event.base';

export class SupplyChainEventCreatedRealtimeEvent extends RealtimeEventBase {
  readonly discriminator = 'supply_chain.event_created' as const;

  constructor(
    occurredAt: Date,
    public readonly eventId: string,
    public readonly shipId: string,
    public readonly type: SupplyChainEventKind,
  ) {
    super(occurredAt);
  }
}
