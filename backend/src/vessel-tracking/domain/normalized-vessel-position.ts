/** Ingestion-time observation (not persisted; not a GraphQL DTO). Speed/heading/destination/eta are not stored yet. */
export type NormalizedVesselPosition = {
  readonly imo: string;
  readonly name?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly speedKnots?: number;
  readonly headingDegrees?: number;
  readonly destination?: string;
  readonly eta?: Date;
  readonly observedAt: Date;
  readonly source: string;
};
