/** In-memory provider fetch metrics (reset on process restart). */
export type VesselTrackingProviderHealthReadonly = {
  readonly providerName: string;
  readonly configured: boolean;
  readonly lastAttemptAt: Date | null;
  readonly lastSuccessAt: Date | null;
  readonly lastFailureAt: Date | null;
  readonly lastErrorMessage: string | null;
  readonly knownImosRequested: number;
  readonly recordsReceived: number;
  readonly recordsNormalized: number;
  readonly recordsReturned: number;
  readonly recordsSkipped: number;
};

/** In-memory ingestion run metrics (reset on process restart). */
export type VesselTrackingIngestionHealthReadonly = {
  readonly lastIngestionAttemptAt: Date | null;
  readonly lastIngestionSuccessAt: Date | null;
  readonly lastIngestionFailureAt: Date | null;
  readonly lastIngestionErrorMessage: string | null;
  readonly lastPositionsApplied: number;
  readonly lastPositionsSkipped: number;
  readonly lastProviderObservations: number;
};

export type VesselTrackingHealthReadonly = {
  readonly mode: string;
  readonly provider: VesselTrackingProviderHealthReadonly;
  readonly ingestion: VesselTrackingIngestionHealthReadonly;
};
