/** Mirrors backend GraphQL enums / shapes (camelCase fields). */

export type ShipCargoType = 'OIL' | 'LNG' | 'CONTAINER' | 'BULK' | 'OTHER';
export type ShipOperationalStatus =
  | 'MOVING'
  | 'WAITING'
  | 'BLOCKED'
  | 'DELAYED';

export interface Ship {
  id: string;
  name: string;
  imo: string;
  country: string;
  cargoType: ShipCargoType;
  capacity: string;
  currentStatus: ShipOperationalStatus;
}

export interface ShipPage {
  items: Ship[];
  total: number;
  offset: number;
  limit: number;
}

export type EnergyPriceKind = 'OIL' | 'GAS';

export interface EnergyPrice {
  id: string;
  type: EnergyPriceKind;
  value: string;
  timestamp: string;
}

export type EnergyPriceTrendDirection = 'UP' | 'DOWN' | 'FLAT';

export interface EnergyPriceTrend {
  kind: EnergyPriceKind;
  points: EnergyPrice[];
  simpleTrend: EnergyPriceTrendDirection;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  summary: string;
  url: string;
}

export interface ShipStatusChangedPayload {
  occurredAt: string;
  shipId: string;
  previousStatus: string;
  newStatus: string;
}

export interface SupplyChainEventCreatedPayload {
  occurredAt: string;
  eventId: string;
  shipId: string;
  type: string;
}
