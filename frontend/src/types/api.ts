/** Mirrors backend GraphQL enums / shapes (camelCase fields). */

import type { CommodityType } from '@supply-chain/maritime-intelligence';

export type { CommodityType };

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
  latitude: number;
  longitude: number;
}

export interface ShipPage {
  items: Ship[];
  total: number;
  offset: number;
  limit: number;
}

export interface EnergyPrice {
  id: string;
  type: CommodityType;
  value: string;
  timestamp: string;
}

export type EnergyPriceTrendDirection = 'UP' | 'DOWN' | 'FLAT';

export interface EnergyPriceTrend {
  kind: CommodityType;
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

export type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  createdAt: string;
};

export interface KpiMaritimeSlice {
  readonly totalVessels: number;
  readonly delayedVessels: number;
  readonly averageDelayTimeHours: number;
}

export interface KpiFinancialSlice {
  readonly totalCargoValue: number;
  readonly estimatedOilValue: number;
  readonly estimatedLngValue: number;
}

export interface KpiSnapshot {
  readonly computedAt: string;
  readonly maritime: KpiMaritimeSlice;
  readonly financial: KpiFinancialSlice;
  readonly alerts: Alert[];
}

export interface ShipStatusChangedPayload {
  occurredAt: string;
  shipId: string;
  previousStatus: string;
  newStatus: string;
  latitude: number;
  longitude: number;
}

export interface SupplyChainEventCreatedPayload {
  occurredAt: string;
  id: string;
  shipId: string;
  type: string;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
}
