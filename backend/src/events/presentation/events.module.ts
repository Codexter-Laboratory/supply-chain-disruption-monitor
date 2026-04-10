import { Module } from '@nestjs/common';
import { ShipsModule } from '../../ships/presentation/ships.module';
import { SUPPLY_CHAIN_EVENT_REPOSITORY } from '../application/supply-chain-event.repository.port';
import { EventsApplicationService } from '../application/events.application.service';
import { PrismaSupplyChainEventRepository } from '../infrastructure/prisma-supply-chain-event.repository';
import { EventsResolver } from './events.resolver';

@Module({
  imports: [ShipsModule],
  providers: [
    EventsApplicationService,
    EventsResolver,
    {
      provide: SUPPLY_CHAIN_EVENT_REPOSITORY,
      useClass: PrismaSupplyChainEventRepository,
    },
  ],
  exports: [EventsApplicationService],
})
export class EventsModule {}
