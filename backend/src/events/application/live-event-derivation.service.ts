import { Injectable } from '@nestjs/common';
import type { Coordinates } from '../../common/domain/coordinates';
import type { ShipOperationalStatus } from '../../ships/domain/ship.entity';
import type { NormalizedVesselPosition } from '../../vessel-tracking/domain/normalized-vessel-position';
import { EventsApplicationService } from './events.application.service';

const STATIONARY_SPEED_KNOTS = 0.5;
const MOVING_CLEARANCE_SPEED_KNOTS = 2;
const STATIONARY_DELAY_THRESHOLD_MS = 30 * 60 * 1000;

type DerivationInput = {
  readonly shipId: string;
  readonly currentStatus: ShipOperationalStatus;
  readonly currentPosition: Coordinates;
  readonly observation: NormalizedVesselPosition;
  readonly occurredAt: Date;
  readonly routeLegId?: string | null;
};

@Injectable()
export class LiveEventDerivationService {
  private readonly lastDestinationByShip = new Map<string, string>();
  private readonly stationaryStartByShip = new Map<string, number>();
  private readonly activeDerivedDelayByShip = new Set<string>();

  constructor(private readonly events: EventsApplicationService) {}

  async deriveFromObservation(input: DerivationInput): Promise<void> {
    const shipId = input.shipId;
    const occurredAt = validDateOrNow(input.occurredAt);
    const routeLegId = input.routeLegId ?? null;

    const normalizedDestination = normalizeDestination(input.observation.destination);
    if (normalizedDestination !== null) {
      const prev = this.lastDestinationByShip.get(shipId);
      this.lastDestinationByShip.set(shipId, normalizedDestination.value);
      if (prev !== undefined && prev !== normalizedDestination.value) {
        await this.events.recordDerivedEvent({
          shipId,
          routeLegId,
          type: 'REROUTE',
          occurredAt,
          description: `Live tracking: destination updated to ${normalizedDestination.label}`,
          latitude: input.currentPosition.latitude,
          longitude: input.currentPosition.longitude,
          dedupeKey: `reroute:${normalizedDestination.value}`,
        });
      }
    }

    const speedKnots = input.observation.speedKnots;
    if (speedKnots === undefined || !Number.isFinite(speedKnots)) {
      return;
    }

    if (speedKnots <= STATIONARY_SPEED_KNOTS) {
      const started =
        this.stationaryStartByShip.get(shipId) ?? occurredAt.getTime();
      this.stationaryStartByShip.set(shipId, started);
      const elapsed = occurredAt.getTime() - started;
      if (
        elapsed >= STATIONARY_DELAY_THRESHOLD_MS &&
        !this.activeDerivedDelayByShip.has(shipId)
      ) {
        const saved = await this.events.recordDerivedEvent({
          shipId,
          routeLegId,
          type: 'DELAY',
          occurredAt,
          description: 'Live tracking: vessel stationary beyond threshold',
          latitude: input.currentPosition.latitude,
          longitude: input.currentPosition.longitude,
          dedupeKey: 'delay:stationary-threshold',
        });
        if (saved !== null) {
          this.activeDerivedDelayByShip.add(shipId);
        }
      }
      return;
    }

    this.stationaryStartByShip.delete(shipId);
    if (
      speedKnots >= MOVING_CLEARANCE_SPEED_KNOTS &&
      this.activeDerivedDelayByShip.has(shipId)
    ) {
      const saved = await this.events.recordDerivedEvent({
        shipId,
        routeLegId,
        type: 'CLEARANCE',
        occurredAt,
        description: 'Live tracking: vessel resumed movement',
        latitude: input.currentPosition.latitude,
        longitude: input.currentPosition.longitude,
        dedupeKey: 'clearance:movement-resumed',
      });
      if (saved !== null) {
        this.activeDerivedDelayByShip.delete(shipId);
      }
    }
  }
}

function normalizeDestination(
  raw: string | undefined,
): { value: string; label: string } | null {
  if (raw === undefined) {
    return null;
  }
  const label = raw.trim();
  if (!label) {
    return null;
  }
  return { label, value: label.toLowerCase() };
}

function validDateOrNow(value: Date): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }
  return new Date();
}
