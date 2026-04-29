import { Inject, Injectable, Logger } from '@nestjs/common';
import { Coordinates } from '../../common/domain/coordinates';
import {
  REALTIME_PUBLISHER,
  type RealtimePublisherPort,
} from '../../realtime/application/realtime-publisher.port';
import { ShipStatusChangedRealtimeEvent } from '../../realtime/domain/ship-status-changed.realtime-event';
import { SHIP_REPOSITORY } from '../../ships/application/ship.repository.port';
import { SHIP_WRITE_PORT } from '../../ships/application/ship-write.port';
import type { ShipRepositoryPort } from '../../ships/application/ship.repository.port';
import type { ShipWritePort } from '../../ships/application/ship-write.port';
import type { NormalizedVesselPosition } from '../domain/normalized-vessel-position';
import {
  VESSEL_TRACKING_PROVIDER,
  type VesselTrackingProviderPort,
} from './vessel-tracking-provider.port';
import { VesselTrackingStatusStore } from './vessel-tracking-status.store';

/** Minimum lat/lng delta to treat as a new position (avoids needless DB/realtime churn). */
export const POSITION_EPSILON_DEGREES = 0.00001;

type ApplyObservationResult =
  | 'applied'
  | 'skipped_empty_imo'
  | 'skipped_invalid_coordinates'
  | 'skipped_unknown_imo'
  | 'skipped_unchanged_position';

@Injectable()
export class VesselTrackingIngestionService {
  private readonly log = new Logger(VesselTrackingIngestionService.name);

  constructor(
    @Inject(VESSEL_TRACKING_PROVIDER)
    private readonly vesselSource: VesselTrackingProviderPort,
    @Inject(SHIP_REPOSITORY) private readonly ships: ShipRepositoryPort,
    @Inject(SHIP_WRITE_PORT) private readonly shipWrite: ShipWritePort,
    @Inject(REALTIME_PUBLISHER) private readonly realtime: RealtimePublisherPort,
    private readonly status: VesselTrackingStatusStore,
  ) {}

  /**
   * Applies provider observations to existing ships only. Not scheduled by default; call from a worker/cron later.
   */
  async ingestLatestPositions(): Promise<void> {
    const attemptAt = new Date();
    this.status.patchIngestion({
      lastIngestionAttemptAt: attemptAt,
    });

    let observations: readonly NormalizedVesselPosition[];
    try {
      observations = await this.vesselSource.fetchLatestPositions();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log.warn(`Vessel tracking provider fetch failed: ${msg}`);
      this.status.patchIngestion({
        lastIngestionFailureAt: attemptAt,
        lastIngestionSuccessAt: null,
        lastIngestionErrorMessage: truncateStatusMessage(msg),
        lastPositionsApplied: 0,
        lastPositionsSkipped: 0,
        lastProviderObservations: 0,
      });
      return;
    }

    let applied = 0;
    let skipped = 0;
    for (const obs of observations) {
      const r = await this.applyObservation(obs);
      if (r === 'applied') {
        applied += 1;
      } else {
        skipped += 1;
      }
    }

    this.status.patchIngestion({
      lastIngestionSuccessAt: new Date(),
      lastIngestionFailureAt: null,
      lastIngestionErrorMessage: null,
      lastPositionsApplied: applied,
      lastPositionsSkipped: skipped,
      lastProviderObservations: observations.length,
    });
  }

  private async applyObservation(
    obs: NormalizedVesselPosition,
  ): Promise<ApplyObservationResult> {
    const imo = obs.imo.trim();
    if (!imo) {
      return 'skipped_empty_imo';
    }

    let coords: Coordinates;
    try {
      coords = Coordinates.restore(obs.latitude, obs.longitude);
    } catch {
      return 'skipped_invalid_coordinates';
    }

    const ship = await this.ships.findByImo(imo);
    if (ship === null) {
      return 'skipped_unknown_imo';
    }

    if (!this.positionMateriallyChanged(ship.position, coords)) {
      return 'skipped_unchanged_position';
    }

    await this.shipWrite.updatePosition(ship.id, coords);

    const occurredAt = occurredAtForRealtime(obs.observedAt);

    await this.realtime.publish(
      new ShipStatusChangedRealtimeEvent(
        occurredAt,
        ship.id,
        ship.currentStatus,
        ship.currentStatus,
        coords.latitude,
        coords.longitude,
      ),
    );

    return 'applied';
  }

  private positionMateriallyChanged(
    existing: Coordinates,
    next: Coordinates,
  ): boolean {
    return (
      Math.abs(existing.latitude - next.latitude) > POSITION_EPSILON_DEGREES ||
      Math.abs(existing.longitude - next.longitude) > POSITION_EPSILON_DEGREES
    );
  }
}

function occurredAtForRealtime(observedAt: Date): Date {
  if (!(observedAt instanceof Date)) {
    return new Date();
  }
  const t = observedAt.getTime();
  return Number.isFinite(t) ? observedAt : new Date();
}

function truncateStatusMessage(msg: string): string {
  const t = msg.trim();
  if (t.length === 0) {
    return 'provider_fetch_failed';
  }
  return t.length > 240 ? `${t.slice(0, 240)}…` : t;
}
