import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../application/pub-sub.token';
import { REALTIME_PUBLISHER } from '../application/realtime-publisher.port';
import { InMemoryRealtimePublisher } from '../infrastructure/in-memory-realtime.publisher';
import { RealtimeSubscriptionsResolver } from './realtime-subscriptions.resolver';

@Global()
@Module({
  providers: [
    { provide: PUB_SUB, useFactory: (): PubSub => new PubSub() },
    {
      provide: REALTIME_PUBLISHER,
      useClass: InMemoryRealtimePublisher,
    },
    RealtimeSubscriptionsResolver,
  ],
  exports: [REALTIME_PUBLISHER, PUB_SUB],
})
export class RealtimeModule {}
