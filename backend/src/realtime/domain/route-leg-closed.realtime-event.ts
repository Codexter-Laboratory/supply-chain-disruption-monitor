import { RealtimeEventBase } from './realtime-event.base';

export class RouteLegClosedRealtimeEvent extends RealtimeEventBase {
  readonly discriminator = 'route.leg_closed' as const;

  constructor(
    occurredAt: Date,
    public readonly routeLegId: string,
    public readonly shipId: string,
  ) {
    super(occurredAt);
  }
}
