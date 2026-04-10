import { Inject, Injectable } from '@nestjs/common';
import type { Ship } from '../domain/ship.entity';
import type { ShipPage } from '../domain/ship-page';
import {
  SHIP_REPOSITORY,
  ShipRepositoryPort,
} from './ship.repository.port';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Ship queries (this module does not record supply-chain events).
 *
 * **Cross-module rule:** changes to operational status that **react** to domain events are
 * orchestrated from the **events** application layer via {@link ShipWritePort}; ships stay the
 * system of record for ship rows, not for event history.
 *
 * **Errors & nulls**
 * - Unknown ship id → `findShipById` returns `null`.
 * - Invalid GraphQL args → presentation validation; numeric bounds still clamped for other callers.
 */
@Injectable()
export class ShipApplicationService {
  constructor(
    @Inject(SHIP_REPOSITORY) private readonly ships: ShipRepositoryPort,
  ) {}

  async findShipById(id: string): Promise<Ship | null> {
    return this.ships.findById(id);
  }

  /**
   * Offset page ordered by name.
   * See `ShipPage` for cursor/`total` scalability notes.
   */
  async listShipsPage(offset: number, limit: number): Promise<ShipPage> {
    const safeOffset = Math.max(0, Math.floor(offset));
    const rawLimit = Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_LIMIT;
    const safeLimit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
    return this.ships.findPage(safeOffset, safeLimit);
  }
}
