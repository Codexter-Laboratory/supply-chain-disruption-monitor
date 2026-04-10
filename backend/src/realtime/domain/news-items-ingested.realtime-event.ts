import { RealtimeEventBase } from './realtime-event.base';

export class NewsItemsIngestedRealtimeEvent extends RealtimeEventBase {
  readonly discriminator = 'news.items_ingested' as const;

  constructor(
    occurredAt: Date,
    public readonly insertedCount: number,
    public readonly source: string,
  ) {
    super(occurredAt);
  }
}
