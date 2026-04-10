import { Inject, Injectable, Logger } from '@nestjs/common';
import { Coordinates } from '../../common/domain/coordinates';
import {
  REALTIME_PUBLISHER,
  RealtimePublisherPort,
} from '../../realtime/application/realtime-publisher.port';
import { ShipStatusChangedRealtimeEvent } from '../../realtime/domain/ship-status-changed.realtime-event';
import { SupplyChainEventCreatedRealtimeEvent } from '../../realtime/domain/supply-chain-event-created.realtime-event';
import type { ShipOperationalStatus } from '../../ships/domain/ship.entity';
import {
  SHIP_REPOSITORY,
  type ShipRepositoryPort,
} from '../../ships/application/ship.repository.port';
import type { ShipWritePort } from '../../ships/application/ship-write.port';
import { SHIP_WRITE_PORT } from '../../ships/application/ship-write.port';
import type { SupplyChainEvent } from '../domain/supply-chain-event.entity';
import {
  SUPPLY_CHAIN_EVENT_REPOSITORY,
  SupplyChainEventRepositoryPort,
} from './supply-chain-event.repository.port';
import {
  regionLabelForCoordinates,
  tradeDestinationCoordinates,
} from './simulation-tick-geo';

const DEFAULT_EVENT_LIMIT = 20;
const MAX_EVENT_LIMIT = 100;

const STATUS_CYCLE: ShipOperationalStatus[] = [
  'MOVING',
  'WAITING',
  'BLOCKED',
  'DELAYED',
];

/**
 * Owns supply-chain **event** lifecycle and **application-level orchestration** that may touch ships.
 *
 * **How events affect ship state (intended production flow)**
 * - Domain **SupplyChainEvent** records facts (delay, incident, etc.).
 * - The **events application service** (or a dedicated handler) interprets those facts and invokes
 *   {@link ShipWritePort} to align **Ship** operational status — e.g. INCIDENT → `BLOCKED`,
 *   CLEARANCE → resume `MOVING`, subject to richer rules later.
 * - **Ship** enforces legal **status transitions** in the domain; persistence adapters stay dumb.
 * - After persistence succeeds, this layer publishes **typed realtime payloads** via
 *   {@link RealtimePublisherPort} so subscribers (GraphQL, websockets, etc.) update without polling.
 *
 * **Simulation tick (ordered side effects)**
 * 1. Persist **SupplyChainEvent** (system of record for the fact).
 * 2. Update **Ship** operational status via {@link ShipWritePort}.
 * 3. Publish **SupplyChainEventCreated** then **ShipStatusChanged** (both use persisted ids / statuses).
 *
 * **Errors & nulls (reads)**
 * - Unknown event id → `findSupplyChainEventById` returns `null`.
 * - Invalid GraphQL args → presentation validation; list limits still clamped here for internal callers.
 */
@Injectable()
export class EventsApplicationService {
  private readonly log = new Logger(EventsApplicationService.name);

  constructor(
    @Inject(SUPPLY_CHAIN_EVENT_REPOSITORY)
    private readonly events: SupplyChainEventRepositoryPort,
    @Inject(SHIP_REPOSITORY) private readonly ships: ShipRepositoryPort,
    @Inject(SHIP_WRITE_PORT) private readonly shipWrite: ShipWritePort,
    @Inject(REALTIME_PUBLISHER) private readonly realtime: RealtimePublisherPort,
  ) {}

  /**
   * Invoked only from `SupplyChainSimulationOrchestrator` on a timer.
   * All writes and realtime fan-out stay in this application service.
   */
  async simulationTick(): Promise<void> {
    const page = await this.ships.findPage(0, 1);
    const ship = page.items[0];
    if (!ship) {
      return;
    }
    const idx = STATUS_CYCLE.indexOf(ship.currentStatus);
    const next =
      STATUS_CYCLE[idx === -1 ? 0 : (idx + 1) % STATUS_CYCLE.length];
    let updated;
    try {
      updated = ship.transitionTo(next);
    } catch (e) {
      this.log.debug(
        `simulationTick: skip transition (${e instanceof Error ? e.message : e})`,
      );
      return;
    }

    const occurredAt = new Date();
    const target = tradeDestinationCoordinates(ship.destinationCountry);
    const stepDegrees = 0.0009;
    const jitterDegrees = 0.00025;
    const p = ship.position;
    const dLat = target.latitude - p.latitude;
    const dLng = target.longitude - p.longitude;
    const len = Math.hypot(dLat, dLng);
    const jitterLat = (Math.random() * 2 - 1) * jitterDegrees;
    const jitterLng = (Math.random() * 2 - 1) * jitterDegrees;
    let nudgedLat: number;
    let nudgedLng: number;
    if (len < 1e-8) {
      nudgedLat = p.latitude + jitterLat;
      nudgedLng = p.longitude + jitterLng;
    } else {
      const uy = dLat / len;
      const ux = dLng / len;
      nudgedLat = p.latitude + uy * stepDegrees + jitterLat;
      nudgedLng = p.longitude + ux * stepDegrees + jitterLng;
    }
    let nudged: Coordinates;
    try {
      nudged = Coordinates.restore(nudgedLat, nudgedLng);
    } catch (e) {
      this.log.debug(
        `simulationTick: keep position (${e instanceof Error ? e.message : e})`,
      );
      nudged = p;
    }

    const evJitter = 0.012;
    const eventLat = p.latitude + (Math.random() * 2 - 1) * evJitter;
    const eventLng = p.longitude + (Math.random() * 2 - 1) * evJitter;
    let eventCoords: Coordinates;
    try {
      eventCoords = Coordinates.restore(eventLat, eventLng);
    } catch (e) {
      this.log.debug(
        `simulationTick: event at ship position (${e instanceof Error ? e.message : e})`,
      );
      eventCoords = p;
    }
    const region = regionLabelForCoordinates(p);

    const saved = await this.events.insert({
      shipId: ship.id,
      routeLegId: null,
      type: 'DELAY',
      timestamp: occurredAt,
      description: 'Simulation: operational status rotation',
      latitude: eventCoords.latitude,
      longitude: eventCoords.longitude,
      region,
    });

    await this.shipWrite.updateOperationalStatus(
      ship.id,
      updated.currentStatus,
    );
    await this.shipWrite.updatePosition(ship.id, nudged);

    await this.realtime.publish(
      new SupplyChainEventCreatedRealtimeEvent(
        occurredAt,
        saved.id,
        saved.shipId,
        saved.type,
      ),
    );
    await this.realtime.publish(
      new ShipStatusChangedRealtimeEvent(
        occurredAt,
        ship.id,
        ship.currentStatus,
        updated.currentStatus,
      ),
    );
  }

  async findSupplyChainEventById(id: string): Promise<SupplyChainEvent | null> {
    return this.events.findById(id);
  }

  async recentEventsForShip(
    shipId: string,
    limit: number,
  ): Promise<readonly SupplyChainEvent[]> {
    const raw = Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_EVENT_LIMIT;
    const safe = Math.min(Math.max(raw, 1), MAX_EVENT_LIMIT);
    return this.events.findRecentForShip(shipId, safe);
  }
}
