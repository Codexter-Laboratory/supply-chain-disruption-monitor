import { Inject, Injectable } from '@nestjs/common';
import type { Ship } from '../domain/ship.entity';
import type { ShipPage } from '../domain/ship-page';
import type { ShipGeoBoundingBox } from './ship-geo-bounding-box';
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

  /**
   * Map viewport / bounding-box reads (indexed lat/lng). Normalizes inverted min/max from callers.
   *
   * TODO: Repository filter assumes a standard axis-aligned box in degree space; antimeridian
   * crossing (longitude wrapping at ±180°) is not handled — boxes that span the date line need a
   * different query strategy later.
   */
  async findShipsInBoundingBox(box: ShipGeoBoundingBox): Promise<readonly Ship[]> {
    const minLat = Math.min(box.minLatitude, box.maxLatitude);
    const maxLat = Math.max(box.minLatitude, box.maxLatitude);
    const minLng = Math.min(box.minLongitude, box.maxLongitude);
    const maxLng = Math.max(box.minLongitude, box.maxLongitude);
    return this.ships.findInBoundingBox({
      minLatitude: minLat,
      maxLatitude: maxLat,
      minLongitude: minLng,
      maxLongitude: maxLng,
    });
  }
}
