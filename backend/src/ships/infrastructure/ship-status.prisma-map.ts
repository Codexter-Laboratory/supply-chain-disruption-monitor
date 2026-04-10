import { ShipStatus } from '@prisma/client';
import type { ShipOperationalStatus } from '../domain/ship.entity';

/** Domain → Prisma enum (write path only; keep Prisma types inside infrastructure). */
export const shipOperationalStatusToPrisma: Record<
  ShipOperationalStatus,
  ShipStatus
> = {
  MOVING: ShipStatus.MOVING,
  WAITING: ShipStatus.WAITING,
  BLOCKED: ShipStatus.BLOCKED,
  DELAYED: ShipStatus.DELAYED,
};
