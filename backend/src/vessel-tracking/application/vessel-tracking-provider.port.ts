import type { NormalizedVesselPosition } from '../domain/normalized-vessel-position';

export const VESSEL_TRACKING_PROVIDER = Symbol('VESSEL_TRACKING_PROVIDER');

export interface VesselTrackingProviderPort {
  fetchLatestPositions(): Promise<readonly NormalizedVesselPosition[]>;
}
