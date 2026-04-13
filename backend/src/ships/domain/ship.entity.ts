import {
  CommodityType,
  estimateCargoVolume,
  isCommodityType,
  type ShipCargoType,
  type ShipOperationalStatus,
} from '@supply-chain/maritime-intelligence';
import { Coordinates } from '../../common/domain/coordinates';
import { Location } from '../../common/domain/location';
import { InvalidDomainStateError } from '../../common/errors/domain.error';

/** Persistence / API enums; canonical definitions live in shared maritime domain. */
export type { ShipCargoType, ShipOperationalStatus };
export { CommodityType };

/** Primitives + enums for reconstitution (mappers, transitions). */
export type ShipRestoreInput = {
  readonly id: string;
  readonly name: string;
  readonly imo: string;
  readonly country: string;
  readonly cargoType: ShipCargoType;
  readonly commodity: CommodityType;
  /** When omitted, derived from {@link capacity} via {@link estimateCargoVolume}. */
  readonly cargoVolume?: number;
  readonly capacity: string;
  readonly currentStatus: ShipOperationalStatus;
  readonly latitude: number;
  readonly longitude: number;
  readonly originCountry: string;
  readonly destinationCountry: string;
  readonly ownerCompany: string;
};

type ShipInternalProps = {
  readonly id: string;
  readonly name: string;
  readonly imo: string;
  readonly country: string;
  readonly cargoType: ShipCargoType;
  readonly commodity: CommodityType;
  readonly cargoVolume: number;
  readonly capacity: string;
  readonly currentStatus: ShipOperationalStatus;
  readonly position: Coordinates;
  readonly origin: Location;
  readonly destination: Location;
  readonly ownerCompany: string;
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

function assertCommodity(value: string): CommodityType {
  if (!isCommodityType(value)) {
    throw new InvalidDomainStateError(`Unknown commodity: ${value}`);
  }
  return value;
}

function assertCargoVolume(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new InvalidDomainStateError(
      'cargoVolume must be a non-negative finite number',
    );
  }
  return value;
}

function resolveCargoVolume(
  rawVolume: number | undefined,
  capacityDecimal: string,
): number {
  const capacityNum = Number(capacityDecimal);
  if (!Number.isFinite(capacityNum) || capacityNum < 0) {
    throw new InvalidDomainStateError(
      'capacity must parse to a non-negative finite number',
    );
  }
  if (rawVolume === undefined) {
    try {
      return estimateCargoVolume(capacityNum);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new InvalidDomainStateError(msg);
    }
  }
  return assertCargoVolume(rawVolume);
}

/**
 * Ship aggregate (read-oriented in this module).
 * Reconstituted from persistence via {@link Ship.restore}; not constructed ad hoc outside tests.
 */
export class Ship {
  private constructor(private readonly props: ShipInternalProps) {}

  static restore(raw: ShipRestoreInput): Ship {
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
    const commodity = assertCommodity(String(raw.commodity));
    const cargoVolume = resolveCargoVolume(raw.cargoVolume, capacity);
    const ownerCompany = assertNonEmpty('Ship ownerCompany', raw.ownerCompany);
    const position = Coordinates.restore(raw.latitude, raw.longitude);
    const origin = Location.ofCountry(raw.originCountry);
    const destination = Location.ofCountry(raw.destinationCountry);
    return new Ship({
      id,
      name,
      imo,
      country,
      cargoType: raw.cargoType,
      commodity,
      cargoVolume,
      capacity,
      currentStatus: raw.currentStatus,
      position,
      origin,
      destination,
      ownerCompany,
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

  get commodity(): CommodityType {
    return this.props.commodity;
  }

  get cargoVolume(): number {
    return this.props.cargoVolume;
  }

  get capacity(): string {
    return this.props.capacity;
  }
  get currentStatus(): ShipOperationalStatus {
    return this.props.currentStatus;
  }

  /** Current reported position (map / geo queries). */
  get position(): Coordinates {
    return this.props.position;
  }

  get originCountry(): string {
    return this.props.origin.country;
  }

  get destinationCountry(): string {
    return this.props.destination.country;
  }

  /** Route origin label (same persistence as {@link originCountry}). */
  get origin(): string {
    return this.props.origin.country;
  }

  /** Route destination label (same persistence as {@link destinationCountry}). */
  get destination(): string {
    return this.props.destination.country;
  }

  get ownerCompany(): string {
    return this.props.ownerCompany;
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
      id: this.props.id,
      name: this.props.name,
      imo: this.props.imo,
      country: this.props.country,
      cargoType: this.props.cargoType,
      commodity: this.props.commodity,
      cargoVolume: this.props.cargoVolume,
      capacity: this.props.capacity,
      currentStatus: next,
      latitude: this.props.position.latitude,
      longitude: this.props.position.longitude,
      originCountry: this.props.origin.country,
      destinationCountry: this.props.destination.country,
      ownerCompany: this.props.ownerCompany,
    });
  }

  withPosition(next: Coordinates): Ship {
    return Ship.restore({
      id: this.props.id,
      name: this.props.name,
      imo: this.props.imo,
      country: this.props.country,
      cargoType: this.props.cargoType,
      commodity: this.props.commodity,
      cargoVolume: this.props.cargoVolume,
      capacity: this.props.capacity,
      currentStatus: this.props.currentStatus,
      latitude: next.latitude,
      longitude: next.longitude,
      originCountry: this.props.origin.country,
      destinationCountry: this.props.destination.country,
      ownerCompany: this.props.ownerCompany,
    });
  }
}
