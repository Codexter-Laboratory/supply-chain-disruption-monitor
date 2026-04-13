import { Module } from '@nestjs/common';
import { CommodityPricingBridgeModule } from '../integration/commodity-pricing-bridge.module';
import { ShipsModule } from '../ships/presentation/ships.module';
import {
  KpiOrchestratorService,
  kpiRefreshSchedulerProvider,
} from './application/kpi-orchestrator.service';
import { KPI_REFRESH_SCHEDULER } from './application/kpi-refresh.port';
import { KpiService } from './application/kpi.service';
import { KpiResolver } from './presentation/kpi.resolver';

@Module({
  imports: [ShipsModule, CommodityPricingBridgeModule],
  providers: [
    KpiService,
    KpiOrchestratorService,
    kpiRefreshSchedulerProvider,
    KpiResolver,
  ],
  exports: [
    KpiService,
    KpiOrchestratorService,
    KPI_REFRESH_SCHEDULER,
  ],
})
export class KpiModule {}
