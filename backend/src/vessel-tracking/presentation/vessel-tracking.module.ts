import { Module } from '@nestjs/common';
import { getVesselTrackingMode } from '../../config/source-mode.config';
import { ShipsModule } from '../../ships/presentation/ships.module';
import { VesselTrackingIngestionService } from '../application/vessel-tracking-ingestion.service';
import {
  VESSEL_TRACKING_PROVIDER,
  type VesselTrackingProviderPort,
} from '../application/vessel-tracking-provider.port';
import { RealAisVesselTrackingProvider } from '../infrastructure/real-ais-vessel-tracking.provider';
import { SimulationVesselTrackingProvider } from '../infrastructure/simulation-vessel-tracking.provider';

@Module({
  imports: [ShipsModule],
  providers: [
    SimulationVesselTrackingProvider,
    RealAisVesselTrackingProvider,
    VesselTrackingIngestionService,
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
