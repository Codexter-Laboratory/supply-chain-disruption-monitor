import { Module } from '@nestjs/common';
import { KpiModule } from '../../kpi/kpi.module';
import { ShipsModule } from '../../ships/presentation/ships.module';
import { SUPPLY_CHAIN_EVENT_REPOSITORY } from '../application/supply-chain-event.repository.port';
import { EventsApplicationService } from '../application/events.application.service';
import { LiveEventDerivationService } from '../application/live-event-derivation.service';
import { PrismaSupplyChainEventRepository } from '../infrastructure/prisma-supply-chain-event.repository';
import { EventsResolver } from './events.resolver';

@Module({
  imports: [ShipsModule, KpiModule],
  providers: [
    EventsApplicationService,
    LiveEventDerivationService,
    EventsResolver,
    {
      provide: SUPPLY_CHAIN_EVENT_REPOSITORY,
      useClass: PrismaSupplyChainEventRepository,
    },
  ],
  exports: [EventsApplicationService, LiveEventDerivationService],
})
export class EventsModule {}
