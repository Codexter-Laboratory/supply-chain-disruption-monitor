import { RouteLeg } from '../domain/route-leg.entity';

export const ROUTE_LEG_REPOSITORY = Symbol('ROUTE_LEG_REPOSITORY');

export type OpenRouteLegInput = {
  readonly shipId: string;
  readonly originPort: string;
  readonly destinationPort: string;
  readonly departureDate: Date;
  readonly estimatedArrival: Date;
  readonly openedAt: Date;
  readonly sequence: number;
};

export type ReplaceCurrentRouteLegInput = {
  readonly currentRouteLegId: string;
  readonly closeAt: Date;
  readonly next: OpenRouteLegInput;
};

export interface RouteLegRepositoryPort {
  findHistoryForShip(shipId: string): Promise<readonly RouteLeg[]>;
  findCurrentForShip(shipId: string): Promise<RouteLeg | null>;
  findLatestSequenceForShip(shipId: string): Promise<number>;
  openLeg(input: OpenRouteLegInput): Promise<RouteLeg>;
  updateEstimatedArrival(routeLegId: string, eta: Date): Promise<void>;
  closeLeg(routeLegId: string, closedAt: Date): Promise<void>;
  replaceCurrentLeg(input: ReplaceCurrentRouteLegInput): Promise<RouteLeg>;
}
