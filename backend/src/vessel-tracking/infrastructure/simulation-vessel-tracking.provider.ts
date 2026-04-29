import { Injectable } from '@nestjs/common';
import type { NormalizedVesselPosition } from '../domain/normalized-vessel-position';
import type { VesselTrackingProviderPort } from '../application/vessel-tracking-provider.port';

@Injectable()
export class SimulationVesselTrackingProvider implements VesselTrackingProviderPort {
  async fetchLatestPositions(): Promise<readonly NormalizedVesselPosition[]> {
    return [];
  }
}
