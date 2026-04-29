import type { Ship } from '../domain/ship.entity';
import type { ShipPage } from '../domain/ship-page';
import type { ShipGeoBoundingBox } from './ship-geo-bounding-box';

export const SHIP_REPOSITORY = Symbol('SHIP_REPOSITORY');

/** Read-only ship persistence; returns domain entities only (no Prisma/DTO types). */
export interface ShipRepositoryPort {
  findById(id: string): Promise<Ship | null>;
  /** Unique IMO as stored in persistence (trim before call for consistent matching). */
  findByImo(imo: string): Promise<Ship | null>;
  /** Distinct persisted IMOs (vessel-tracking / external feed correlation only). */
  findKnownImos(): Promise<readonly string[]>;
  findPage(offset: number, limit: number): Promise<ShipPage>;
  /** Axis-aligned bounds in degrees; antimeridian not handled. */
  findInBoundingBox(box: ShipGeoBoundingBox): Promise<readonly Ship[]>;
  /** Full fleet ordered by name (KPI / analytics; bounded by DB size). */
  findAllOrderedByName(): Promise<readonly Ship[]>;
}
