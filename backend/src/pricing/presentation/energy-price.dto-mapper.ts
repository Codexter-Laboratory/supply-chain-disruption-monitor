import type { EnergyPrice, EnergyPriceKind } from '../domain/energy-price.entity';
import type { EnergyPriceTrend } from '../domain/energy-price-trend';
import type { TrendDirection } from '../domain/energy-price-trend';
import {
  EnergyPriceGraphqlType,
  EnergyPriceKindGql,
} from './energy-price.graphql-types';
import {
  EnergyPriceTrendGraphqlType,
  TrendDirectionGql,
} from './energy-price-trend.graphql-types';

const kindToGql: Record<EnergyPriceKind, EnergyPriceKindGql> = {
  OIL: EnergyPriceKindGql.OIL,
  GAS: EnergyPriceKindGql.GAS,
};

const trendToGql: Record<TrendDirection, TrendDirectionGql> = {
  UP: TrendDirectionGql.UP,
  DOWN: TrendDirectionGql.DOWN,
  FLAT: TrendDirectionGql.FLAT,
};

export function gqlKindToDomain(kind: EnergyPriceKindGql): EnergyPriceKind {
  return kind as unknown as EnergyPriceKind;
}

export function toEnergyPriceGraphql(row: EnergyPrice): EnergyPriceGraphqlType {
  const dto = new EnergyPriceGraphqlType();
  dto.id = row.id;
  dto.type = kindToGql[row.type];
  dto.value = row.value;
  dto.timestamp = row.timestamp;
  return dto;
}

export function toEnergyPriceTrendGraphql(
  trend: EnergyPriceTrend,
): EnergyPriceTrendGraphqlType {
  const dto = new EnergyPriceTrendGraphqlType();
  dto.kind = kindToGql[trend.kind];
  dto.points = trend.points.map(toEnergyPriceGraphql);
  dto.simpleTrend = trendToGql[trend.simpleTrend];
  return dto;
}
