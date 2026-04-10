/** Base for strongly typed realtime payloads (no loose stringly-typed events). */
export abstract class RealtimeEventBase {
  constructor(public readonly occurredAt: Date) {}

  abstract readonly discriminator: RealtimeEventDiscriminator;
}

export type RealtimeEventDiscriminator =
  | 'ship.status_changed'
  | 'supply_chain.event_created'
  | 'route.leg_opened'
  | 'route.leg_closed'
  | 'energy_price.recorded'
  | 'news.items_ingested';
