import type {
  SupplyChainEvent,
  SupplyChainEventKind,
} from '../domain/supply-chain-event.entity';

export const SUPPLY_CHAIN_EVENT_REPOSITORY = Symbol(
  'SUPPLY_CHAIN_EVENT_REPOSITORY',
);

export type NewSupplyChainEventRecord = {
  readonly shipId: string;
  readonly routeLegId: string | null;
  readonly type: SupplyChainEventKind;
  readonly timestamp: Date;
  readonly description: string;
};

/** Event persistence; domain entities only (no Prisma/GraphQL leakage). */
export interface SupplyChainEventRepositoryPort {
  findById(id: string): Promise<SupplyChainEvent | null>;
  findRecentForShip(
    shipId: string,
    limit: number,
  ): Promise<readonly SupplyChainEvent[]>;
  insert(record: NewSupplyChainEventRecord): Promise<SupplyChainEvent>;
}
