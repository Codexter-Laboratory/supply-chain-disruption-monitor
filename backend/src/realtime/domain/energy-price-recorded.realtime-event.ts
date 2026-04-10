import { RealtimeEventBase } from './realtime-event.base';

export class EnergyPriceRecordedRealtimeEvent extends RealtimeEventBase {
  readonly discriminator = 'energy_price.recorded' as const;

  constructor(
    occurredAt: Date,
    public readonly priceId: string,
    public readonly type: string,
    public readonly value: string,
  ) {
    super(occurredAt);
  }
}
