import { Module } from '@nestjs/common';
import { getVesselTrackingMode } from '../../config/source-mode.config';
import { RoutesModule } from '../../routes/presentation/routes.module';
import { HttpClientModule } from '../../shared/http/http.module';
import { ShipsModule } from '../../ships/presentation/ships.module';
import { VesselTrackingIngestionService } from '../application/vessel-tracking-ingestion.service';
import { VesselTrackingStatusStore } from '../application/vessel-tracking-status.store';
import { VesselTrackingHealthResolver } from './vessel-tracking-health.resolver';
import {
  VESSEL_TRACKING_PROVIDER,
  type VesselTrackingProviderPort,
} from '../application/vessel-tracking-provider.port';
import { RealAisVesselTrackingProvider } from '../infrastructure/real-ais-vessel-tracking.provider';
import { SimulationVesselTrackingProvider } from '../infrastructure/simulation-vessel-tracking.provider';

@Module({
  imports: [ShipsModule, RoutesModule, HttpClientModule],
  providers: [
    VesselTrackingStatusStore,
    SimulationVesselTrackingProvider,
    RealAisVesselTrackingProvider,
    VesselTrackingIngestionService,
    VesselTrackingHealthResolver,
    {
      provide: VESSEL_TRACKING_PROVIDER,
      useFactory: (
        simulation: SimulationVesselTrackingProvider,
        realAis: RealAisVesselTrackingProvider,
      ): VesselTrackingProviderPort => {
        const mode = getVesselTrackingMode();
        if (mode === 'real') {
          return realAis;
        }
        return simulation;
      },
      inject: [SimulationVesselTrackingProvider, RealAisVesselTrackingProvider],
    },
  ],
  exports: [VesselTrackingIngestionService],
})
export class VesselTrackingModule {}
