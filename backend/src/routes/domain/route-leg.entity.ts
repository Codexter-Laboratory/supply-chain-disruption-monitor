/**
 * One historical segment of a ship's planned route.
 * Current segment has closedAt === null; past segments are immutable except for closing metadata.
 */
export interface RouteLeg {
  readonly id: string;
  readonly shipId: string;
  readonly originPort: string;
  readonly destinationPort: string;
  readonly departureDate: Date;
  readonly estimatedArrival: Date;
  readonly openedAt: Date;
  readonly closedAt: Date | null;
  readonly sequence: number;
}
