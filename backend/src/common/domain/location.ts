import { InvalidDomainStateError } from '../errors/domain.error';

/** Named trade or registry endpoint; currently models a non-empty country label. */
export class Location {
  private constructor(private readonly label: string) {}

  static ofCountry(raw: string): Location {
    const t = raw.trim();
    if (!t) {
      throw new InvalidDomainStateError('Location country must be non-empty');
    }
    return new Location(t);
  }

  /** Human-readable country name (or ISO label) for routes and UI. */
  get country(): string {
    return this.label;
  }
}
