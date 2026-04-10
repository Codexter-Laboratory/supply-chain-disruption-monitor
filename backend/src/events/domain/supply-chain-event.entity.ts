import { InvalidDomainStateError } from '../../common/errors/domain.error';

export type SupplyChainEventKind =
  | 'DELAY'
  | 'INCIDENT'
  | 'REROUTE'
  | 'CLEARANCE';

export type SupplyChainEventProps = {
  readonly id: string;
  readonly shipId: string;
  readonly routeLegId: string | null;
  readonly type: SupplyChainEventKind;
  readonly timestamp: Date;
  readonly description: string;
};

const KINDS: SupplyChainEventKind[] = [
  'DELAY',
  'INCIDENT',
  'REROUTE',
  'CLEARANCE',
];

function assertNonEmpty(label: string, value: string): string {
  const t = value.trim();
  if (!t) {
    throw new InvalidDomainStateError(`${label} must be non-empty`);
  }
  return t;
}

/**
 * Record of a supply-chain-impacting occurrence.
 * Created only through the events application layer in the full system.
 */
export class SupplyChainEvent {
  private constructor(private readonly props: SupplyChainEventProps) {}

  static restore(raw: SupplyChainEventProps): SupplyChainEvent {
    const id = assertNonEmpty('SupplyChainEvent id', raw.id);
    const shipId = assertNonEmpty('SupplyChainEvent shipId', raw.shipId);
    const description = assertNonEmpty(
      'SupplyChainEvent description',
      raw.description,
    );
    if (!(raw.timestamp instanceof Date) || Number.isNaN(raw.timestamp.getTime())) {
      throw new InvalidDomainStateError('SupplyChainEvent timestamp must be a valid Date');
    }
    if (!KINDS.includes(raw.type)) {
      throw new InvalidDomainStateError(`Unknown supply-chain event type: ${raw.type}`);
    }
    const routeLegId =
      raw.routeLegId === null || raw.routeLegId.trim() === ''
        ? null
        : assertNonEmpty('SupplyChainEvent routeLegId', raw.routeLegId);
    return new SupplyChainEvent({
      id,
      shipId,
      routeLegId,
      type: raw.type,
      timestamp: raw.timestamp,
      description,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get shipId(): string {
    return this.props.shipId;
  }
  get routeLegId(): string | null {
    return this.props.routeLegId;
  }
  get type(): SupplyChainEventKind {
    return this.props.type;
  }
  get timestamp(): Date {
    return this.props.timestamp;
  }
  get description(): string {
    return this.props.description;
  }

  concernsShip(shipId: string): boolean {
    return this.props.shipId === shipId;
  }

  hasRouteLeg(): boolean {
    return this.props.routeLegId !== null;
  }
}
