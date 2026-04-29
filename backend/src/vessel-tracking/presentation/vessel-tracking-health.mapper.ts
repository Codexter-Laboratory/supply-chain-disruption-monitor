import type { VesselTrackingHealthReadonly } from '../domain/vessel-tracking-health.types';
import {
  VesselTrackingHealthGql,
  VesselTrackingIngestionHealthGql,
  VesselTrackingProviderHealthGql,
} from './vessel-tracking-health.graphql-types';

export function mapVesselTrackingHealthToGql(
  snap: VesselTrackingHealthReadonly,
): VesselTrackingHealthGql {
  const root = new VesselTrackingHealthGql();
  root.mode = snap.mode;

  const p = new VesselTrackingProviderHealthGql();
  p.providerName = snap.provider.providerName;
  p.configured = snap.provider.configured;
  p.lastAttemptAt = snap.provider.lastAttemptAt;
  p.lastSuccessAt = snap.provider.lastSuccessAt;
  p.lastFailureAt = snap.provider.lastFailureAt;
  p.lastErrorMessage = snap.provider.lastErrorMessage;
  p.knownImosRequested = snap.provider.knownImosRequested;
  p.recordsReceived = snap.provider.recordsReceived;
  p.recordsNormalized = snap.provider.recordsNormalized;
  p.recordsReturned = snap.provider.recordsReturned;
  p.recordsSkipped = snap.provider.recordsSkipped;
  root.provider = p;

  const i = new VesselTrackingIngestionHealthGql();
  i.lastIngestionAttemptAt = snap.ingestion.lastIngestionAttemptAt;
  i.lastIngestionSuccessAt = snap.ingestion.lastIngestionSuccessAt;
  i.lastIngestionFailureAt = snap.ingestion.lastIngestionFailureAt;
  i.lastIngestionErrorMessage = snap.ingestion.lastIngestionErrorMessage;
  i.lastPositionsApplied = snap.ingestion.lastPositionsApplied;
  i.lastPositionsSkipped = snap.ingestion.lastPositionsSkipped;
  i.lastProviderObservations = snap.ingestion.lastProviderObservations;
  root.ingestion = i;

  return root;
}
