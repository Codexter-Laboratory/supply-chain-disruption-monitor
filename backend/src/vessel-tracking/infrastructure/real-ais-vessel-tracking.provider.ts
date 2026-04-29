import { Injectable } from '@nestjs/common';
import type { NormalizedVesselPosition } from '../domain/normalized-vessel-position';
import type { VesselTrackingProviderPort } from '../application/vessel-tracking-provider.port';

/** Placeholder for a future live AIS integration; no outbound I/O. */
@Injectable()
export class RealAisVesselTrackingProvider implements VesselTrackingProviderPort {
  async fetchLatestPositions(): Promise<readonly NormalizedVesselPosition[]> {
    return [];
  }
}
