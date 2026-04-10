import type { ShipOperationalStatus } from '../../ships/domain/ship.entity';
import { RealtimeEventBase } from './realtime-event.base';

export class ShipStatusChangedRealtimeEvent extends RealtimeEventBase {
  readonly discriminator = 'ship.status_changed' as const;

  constructor(
    occurredAt: Date,
    public readonly shipId: string,
    public readonly previousStatus: ShipOperationalStatus,
    public readonly newStatus: ShipOperationalStatus,
  ) {
    super(occurredAt);
  }
}
