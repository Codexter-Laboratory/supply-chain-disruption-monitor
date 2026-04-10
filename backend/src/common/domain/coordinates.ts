import { InvalidDomainStateError } from '../errors/domain.error';

/**
 * Geographic point on the WGS-84 sphere (dashboard / map read models).
 * Bounds are validated once at construction; entities should store this instead of raw numbers.
 */
export class Coordinates {
  private constructor(
    private readonly lat: number,
    private readonly lng: number,
  ) {}

  static restore(latitude: number, longitude: number): Coordinates {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new InvalidDomainStateError('Coordinates require finite latitude and longitude');
    }
    if (latitude < -90 || latitude > 90) {
      throw new InvalidDomainStateError(
        `Latitude must be within [-90, 90], got ${latitude}`,
      );
    }
    if (longitude < -180 || longitude > 180) {
      throw new InvalidDomainStateError(
        `Longitude must be within [-180, 180], got ${longitude}`,
      );
    }
    return new Coordinates(latitude, longitude);
  }

  get latitude(): number {
    return this.lat;
  }

  get longitude(): number {
    return this.lng;
  }
}
