import { Inject, Injectable } from '@nestjs/common';
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

/** Minimum lat/lng delta to treat as a new position (avoids needless DB/realtime churn). */
export const POSITION_EPSILON_DEGREES = 0.00001;

@Injectable()
export class VesselTrackingIngestionService {
  constructor(
    @Inject(VESSEL_TRACKING_PROVIDER)
    private readonly vesselSource: VesselTrackingProviderPort,
    @Inject(SHIP_REPOSITORY) private readonly ships: ShipRepositoryPort,
    @Inject(SHIP_WRITE_PORT) private readonly shipWrite: ShipWritePort,
    @Inject(REALTIME_PUBLISHER) private readonly realtime: RealtimePublisherPort,
  ) {}

  /**
   * Applies provider observations to existing ships only. Not scheduled by default; call from a worker/cron later.
   */
  async ingestLatestPositions(): Promise<void> {
    const observations = await this.vesselSource.fetchLatestPositions();
    for (const obs of observations) {
      await this.applyObservation(obs);
    }
  }

  private async applyObservation(obs: NormalizedVesselPosition): Promise<void> {
    const imo = obs.imo.trim();
    if (!imo) {
      return;
    }

    let coords: Coordinates;
    try {
      coords = Coordinates.restore(obs.latitude, obs.longitude);
    } catch {
      return;
    }

    const ship = await this.ships.findByImo(imo);
    if (ship === null) {
      return;
    }

    if (!this.positionMateriallyChanged(ship.position, coords)) {
      return;
    }

    await this.shipWrite.updatePosition(ship.id, coords);

    await this.realtime.publish(
      new ShipStatusChangedRealtimeEvent(
        obs.observedAt,
        ship.id,
        ship.currentStatus,
        ship.currentStatus,
        coords.latitude,
        coords.longitude,
      ),
    );
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
