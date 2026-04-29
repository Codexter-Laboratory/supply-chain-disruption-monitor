import { Injectable } from '@nestjs/common';
import { getVesselTrackingMode } from '../../config/source-mode.config';
import type {
  VesselTrackingHealthReadonly,
  VesselTrackingIngestionHealthReadonly,
  VesselTrackingProviderHealthReadonly,
} from '../domain/vessel-tracking-health.types';

const emptyProvider = (): VesselTrackingProviderHealthReadonly => ({
  providerName: '—',
  configured: false,
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastErrorMessage: null,
  knownImosRequested: 0,
  recordsReceived: 0,
  recordsNormalized: 0,
  recordsReturned: 0,
  recordsSkipped: 0,
});

const emptyIngestion = (): VesselTrackingIngestionHealthReadonly => ({
  lastIngestionAttemptAt: null,
  lastIngestionSuccessAt: null,
  lastIngestionFailureAt: null,
  lastIngestionErrorMessage: null,
  lastPositionsApplied: 0,
  lastPositionsSkipped: 0,
  lastProviderObservations: 0,
});

@Injectable()
export class VesselTrackingStatusStore {
  private provider = emptyProvider();
  private ingestion = emptyIngestion();

  getSnapshot(): VesselTrackingHealthReadonly {
    return {
      mode: getVesselTrackingMode(),
      provider: { ...this.provider },
      ingestion: { ...this.ingestion },
    };
  }

  patchProvider(p: Partial<VesselTrackingProviderHealthReadonly>): void {
    this.provider = { ...this.provider, ...p };
  }

  patchIngestion(p: Partial<VesselTrackingIngestionHealthReadonly>): void {
    this.ingestion = { ...this.ingestion, ...p };
  }
}
