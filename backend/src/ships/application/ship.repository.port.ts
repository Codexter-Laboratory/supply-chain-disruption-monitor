import type { Ship } from '../domain/ship.entity';
import type { ShipPage } from '../domain/ship-page';

export const SHIP_REPOSITORY = Symbol('SHIP_REPOSITORY');

/** Read-only ship persistence; returns domain entities only (no Prisma/DTO types). */
export interface ShipRepositoryPort {
  findById(id: string): Promise<Ship | null>;
  findPage(offset: number, limit: number): Promise<ShipPage>;
}
