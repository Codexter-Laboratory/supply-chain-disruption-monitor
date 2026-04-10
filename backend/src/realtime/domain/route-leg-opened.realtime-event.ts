import { RealtimeEventBase } from './realtime-event.base';

export class RouteLegOpenedRealtimeEvent extends RealtimeEventBase {
  readonly discriminator = 'route.leg_opened' as const;

  constructor(
    occurredAt: Date,
    public readonly routeLegId: string,
    public readonly shipId: string,
  ) {
    super(occurredAt);
  }
}
