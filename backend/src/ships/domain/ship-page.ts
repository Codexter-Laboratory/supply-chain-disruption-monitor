import type { Ship } from './ship.entity';

/**
 * Offset-limited page of ships.
 *
 * **Scalability (offset / limit)**:
 * - `skip`/`take` pagination is simple but degrades on large offsets (scans skipped rows).
 * - For high-volume listings, prefer **cursor-based** pages (e.g. `where: { id: { gt: cursor } }`
 *   on an indexed column) and drop `total` from the hot path.
 *
 * **Total count**:
 * - A separate `COUNT(*)` (see repository) adds an extra query and can be expensive on huge
 *   tables; consider making totals optional or approximate in production UIs.
 */
export interface ShipPage {
  /** Domain {@link Ship} entities (not plain DTOs). */
  readonly items: readonly Ship[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
}
