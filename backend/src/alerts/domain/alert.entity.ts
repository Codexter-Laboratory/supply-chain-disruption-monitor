export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  HIGH_VALUE_DELAY = 'HIGH_VALUE_DELAY',
  PRICE_SPIKE = 'PRICE_SPIKE',
  SUPPLY_DISRUPTION = 'SUPPLY_DISRUPTION',
  COMMODITY_STRESS = 'COMMODITY_STRESS',
}

export class Alert {
  constructor(
    public readonly id: string,
    public readonly type: AlertType,
    public readonly severity: AlertSeverity,
    public readonly message: string,
    public readonly createdAt: Date,
  ) {}
}
