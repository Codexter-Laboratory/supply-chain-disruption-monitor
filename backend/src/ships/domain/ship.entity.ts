import { InvalidDomainStateError } from '../../common/errors/domain.error';

/** Cargo category for routing and capacity planning (domain vocabulary). */
export type ShipCargoType = 'OIL' | 'LNG' | 'CONTAINER' | 'BULK' | 'OTHER';

/** Operational state; may be driven by events module in the full system. */
export type ShipOperationalStatus =
  | 'MOVING'
  | 'WAITING'
  | 'BLOCKED'
  | 'DELAYED';

export type ShipProps = {
  readonly id: string;
  readonly name: string;
  readonly imo: string;
  readonly country: string;
  readonly cargoType: ShipCargoType;
  readonly capacity: string;
  readonly currentStatus: ShipOperationalStatus;
};

const ALL_STATUSES: ShipOperationalStatus[] = [
  'MOVING',
  'WAITING',
  'BLOCKED',
  'DELAYED',
];

const CARGO_TYPES: ShipCargoType[] = [
  'OIL',
  'LNG',
  'CONTAINER',
  'BULK',
  'OTHER',
];

/** Minimal transition graph: any operational change except self (extend per business rules later). */
const ALLOWED_NEXT: Record<
  ShipOperationalStatus,
  readonly ShipOperationalStatus[]
> = {
  MOVING: ['WAITING', 'BLOCKED', 'DELAYED'],
  WAITING: ['MOVING', 'BLOCKED', 'DELAYED'],
  BLOCKED: ['MOVING', 'WAITING', 'DELAYED'],
  DELAYED: ['MOVING', 'WAITING', 'BLOCKED'],
};

const CAPACITY_PATTERN = /^\d+(\.\d+)?$/;

function assertNonEmpty(label: string, value: string): string {
  const t = value.trim();
  if (!t) {
    throw new InvalidDomainStateError(`${label} must be non-empty`);
  }
  return t;
}

/**
 * Ship aggregate (read-oriented in this module).
 * Reconstituted from persistence via {@link Ship.restore}; not constructed ad hoc outside tests.
 */
export class Ship {
  private constructor(private readonly props: ShipProps) {}

  static restore(raw: ShipProps): Ship {
    const id = assertNonEmpty('Ship id', raw.id);
    const name = assertNonEmpty('Ship name', raw.name);
    const imo = assertNonEmpty('Ship IMO', raw.imo);
    if (!/^[\dA-Z]{7,10}$/i.test(imo)) {
      throw new InvalidDomainStateError(
        `Ship IMO must be 7–10 letters or digits: ${imo}`,
      );
    }
    const country = assertNonEmpty('Ship country', raw.country);
    const capacity = assertNonEmpty('Ship capacity', raw.capacity);
    if (!CAPACITY_PATTERN.test(capacity)) {
      throw new InvalidDomainStateError(
        `Ship capacity must be a non-negative decimal string: ${capacity}`,
      );
    }
    if (!ALL_STATUSES.includes(raw.currentStatus)) {
      throw new InvalidDomainStateError(`Unknown ship status: ${raw.currentStatus}`);
    }
    if (!CARGO_TYPES.includes(raw.cargoType)) {
      throw new InvalidDomainStateError(`Unknown cargo type: ${raw.cargoType}`);
    }
    const cargoType = raw.cargoType;
    return new Ship({
      id,
      name,
      imo,
      country,
      cargoType,
      capacity,
      currentStatus: raw.currentStatus,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get imo(): string {
    return this.props.imo;
  }
  get country(): string {
    return this.props.country;
  }
  get cargoType(): ShipCargoType {
    return this.props.cargoType;
  }
  get capacity(): string {
    return this.props.capacity;
  }
  get currentStatus(): ShipOperationalStatus {
    return this.props.currentStatus;
  }

  get isUnderway(): boolean {
    return this.props.currentStatus === 'MOVING';
  }

  /**
   * Domain transition rules. Persistence and realtime fan-out belong in application orchestration.
   */
  transitionTo(next: ShipOperationalStatus): Ship {
    if (next === this.props.currentStatus) {
      throw new InvalidDomainStateError(
        'Ship status transition must change the current status',
      );
    }
    if (!ALLOWED_NEXT[this.props.currentStatus].includes(next)) {
      throw new InvalidDomainStateError(
        `Illegal ship status transition: ${this.props.currentStatus} → ${next}`,
      );
    }
    return Ship.restore({
      ...this.props,
      currentStatus: next,
    });
  }
}
