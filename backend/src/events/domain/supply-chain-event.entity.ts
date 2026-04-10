import { Coordinates } from '../../common/domain/coordinates';
import { InvalidDomainStateError } from '../../common/errors/domain.error';

export type SupplyChainEventKind =
  | 'DELAY'
  | 'INCIDENT'
  | 'REROUTE'
  | 'CLEARANCE';

export type SupplyChainEventRestoreInput = {
  readonly id: string;
  readonly shipId: string;
  readonly routeLegId: string | null;
  readonly type: SupplyChainEventKind;
  readonly timestamp: Date;
  readonly description: string;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly region?: string | null;
};

type SupplyChainEventInternalProps = {
  readonly id: string;
  readonly shipId: string;
  readonly routeLegId: string | null;
  readonly type: SupplyChainEventKind;
  readonly timestamp: Date;
  readonly description: string;
  readonly position: Coordinates | null;
  readonly region: string | null;
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

function normalizeOptionalRegion(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  const t = raw.trim();
  return t === '' ? null : t;
}

/**
 * Record of a supply-chain-impacting occurrence.
 * Created only through the events application layer in the full system.
 */
export class SupplyChainEvent {
  private constructor(private readonly props: SupplyChainEventInternalProps) {}

  static restore(raw: SupplyChainEventRestoreInput): SupplyChainEvent {
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

    const hasLat = raw.latitude != null;
    const hasLng = raw.longitude != null;
    if (hasLat !== hasLng) {
      throw new InvalidDomainStateError(
        'SupplyChainEvent latitude and longitude must both be present or both absent',
      );
    }
    const position =
      hasLat && hasLng
        ? Coordinates.restore(raw.latitude as number, raw.longitude as number)
        : null;

    return new SupplyChainEvent({
      id,
      shipId,
      routeLegId,
      type: raw.type,
      timestamp: raw.timestamp,
      description,
      position,
      region: normalizeOptionalRegion(raw.region),
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

  /** When set, both latitude and longitude were supplied at restore time. */
  get position(): Coordinates | null {
    return this.props.position;
  }

  get region(): string | null {
    return this.props.region;
  }

  concernsShip(shipId: string): boolean {
    return this.props.shipId === shipId;
  }

  hasRouteLeg(): boolean {
    return this.props.routeLegId !== null;
  }
}
