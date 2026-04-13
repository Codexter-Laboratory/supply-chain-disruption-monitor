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

const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;
/** Minimum span so bbox queries stay index-friendly and non-degenerate. */
const MIN_SPAN_DEG = 1e-5;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Clamp, order, and lightly expand degenerate boxes. Returns `null` if the box crosses the
 * antimeridian (minLng > maxLng), which the repository filter does not support.
 */
function normalizeBoundingBox(
  box: ShipGeoBoundingBox,
): ShipGeoBoundingBox | null {
  let minLat = clamp(
    Math.min(box.minLatitude, box.maxLatitude),
    LAT_MIN,
    LAT_MAX,
  );
  let maxLat = clamp(
    Math.max(box.minLatitude, box.maxLatitude),
    LAT_MIN,
    LAT_MAX,
  );
  let minLng = clamp(
    Math.min(box.minLongitude, box.maxLongitude),
    LNG_MIN,
    LNG_MAX,
  );
  let maxLng = clamp(
    Math.max(box.minLongitude, box.maxLongitude),
    LNG_MIN,
    LNG_MAX,
  );

  if (minLng > maxLng) {
    return null;
  }

  if (maxLat - minLat < MIN_SPAN_DEG) {
    minLat = clamp(minLat - MIN_SPAN_DEG, LAT_MIN, LAT_MAX);
    maxLat = clamp(maxLat + MIN_SPAN_DEG, LAT_MIN, LAT_MAX);
  }
  if (maxLng - minLng < MIN_SPAN_DEG) {
    minLng = clamp(minLng - MIN_SPAN_DEG, LNG_MIN, LNG_MAX);
    maxLng = clamp(maxLng + MIN_SPAN_DEG, LNG_MIN, LNG_MAX);
  }

  return {
    minLatitude: minLat,
    maxLatitude: maxLat,
    minLongitude: minLng,
    maxLongitude: maxLng,
  };
}

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
   * Map viewport / bounding-box reads (indexed lat/lng). Clamps to WGS-84 ranges, orders
   * min/max, expands degenerate spans, and skips unsupported antimeridian boxes (returns `[]`).
   *
   * TODO: Repository filter does not split queries across the date line.
   */
  async findShipsInBoundingBox(box: ShipGeoBoundingBox): Promise<readonly Ship[]> {
    const normalized = normalizeBoundingBox(box);
    if (!normalized) {
      return [];
    }
    return this.ships.findInBoundingBox(normalized);
  }

  /** Entire fleet (KPI aggregation, exports). */
  async listAllShipsOrdered(): Promise<readonly Ship[]> {
    return this.ships.findAllOrderedByName();
  }
}
