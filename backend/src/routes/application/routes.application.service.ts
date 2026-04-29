import { Inject, Injectable } from '@nestjs/common';
import {
  ROUTE_LEG_REPOSITORY,
  RouteLegRepositoryPort,
} from './route-leg.repository.port';
import { RouteLeg } from '../domain/route-leg.entity';

const ETA_UPDATE_THRESHOLD_MS = 15 * 60 * 1000;
const UNKNOWN_ORIGIN_PORT = 'UNKNOWN';

export type RouteLegObservationSyncInput = {
  readonly shipId: string;
  readonly destination?: string;
  readonly eta?: Date;
  readonly observedAt: Date;
};

@Injectable()
export class RoutesApplicationService {
  constructor(
    @Inject(ROUTE_LEG_REPOSITORY)
    private readonly legs: RouteLegRepositoryPort,
  ) {}

  async routeHistoryForShip(shipId: string): Promise<readonly RouteLeg[]> {
    return this.legs.findHistoryForShip(shipId);
  }

  async syncCurrentLegFromObservation(
    input: RouteLegObservationSyncInput,
  ): Promise<void> {
    const destination = input.destination?.trim();
    if (!destination) {
      return;
    }
    const eta = input.eta;
    if (!(eta instanceof Date) || !Number.isFinite(eta.getTime())) {
      return;
    }
    const observedAt = validObservedAt(input.observedAt);

    const current = await this.legs.findCurrentForShip(input.shipId);
    if (current === null) {
      const latest = await this.legs.findLatestSequenceForShip(input.shipId);
      await this.legs.openLeg({
        shipId: input.shipId,
        originPort: UNKNOWN_ORIGIN_PORT,
        destinationPort: destination,
        departureDate: observedAt,
        estimatedArrival: eta,
        openedAt: observedAt,
        sequence: latest + 1,
      });
      return;
    }

    if (current.destinationPort.trim() === destination) {
      const diffMs = Math.abs(
        current.estimatedArrival.getTime() - eta.getTime(),
      );
      if (diffMs >= ETA_UPDATE_THRESHOLD_MS) {
        await this.legs.updateEstimatedArrival(current.id, eta);
      }
      return;
    }

    await this.legs.closeLeg(current.id, observedAt);
    const latest = await this.legs.findLatestSequenceForShip(input.shipId);
    await this.legs.openLeg({
      shipId: input.shipId,
      originPort: current.destinationPort || UNKNOWN_ORIGIN_PORT,
      destinationPort: destination,
      departureDate: observedAt,
      estimatedArrival: eta,
      openedAt: observedAt,
      sequence: Math.max(latest, current.sequence) + 1,
    });
  }
}

function validObservedAt(value: Date): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }
  return new Date();
}
