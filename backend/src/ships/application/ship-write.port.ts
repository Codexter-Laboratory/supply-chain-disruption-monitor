import type { ShipOperationalStatus } from '../domain/ship.entity';

export const SHIP_WRITE_PORT = Symbol('SHIP_WRITE_PORT');

/**
 * Write surface for ship state mutated by other bounded contexts (e.g. events).
 * Ships module does not create or modify supply-chain events.
 */
export interface ShipWritePort {
  updateOperationalStatus(
    shipId: string,
    status: ShipOperationalStatus,
  ): Promise<void>;
}
