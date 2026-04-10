export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

/** Thrown when aggregate invariants or state transitions are violated. */
export class InvalidDomainStateError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDomainStateError';
  }
}
