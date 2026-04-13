import type { EnergyPrice } from '../domain/energy-price.entity';
import type { EnergyPriceTrend } from '../domain/energy-price-trend';
import type { TrendDirection } from '../domain/energy-price-trend';
import { EnergyPriceGraphqlType } from './energy-price.graphql-types';
import {
  EnergyPriceTrendGraphqlType,
  TrendDirectionGql,
} from './energy-price-trend.graphql-types';

const trendToGql: Record<TrendDirection, TrendDirectionGql> = {
  UP: TrendDirectionGql.UP,
  DOWN: TrendDirectionGql.DOWN,
  FLAT: TrendDirectionGql.FLAT,
};

export function toEnergyPriceGraphql(row: EnergyPrice): EnergyPriceGraphqlType {
  const dto = new EnergyPriceGraphqlType();
  dto.id = row.id;
  dto.type = row.type;
  dto.value = row.value;
  dto.timestamp = row.timestamp;
  return dto;
}

export function toEnergyPriceTrendGraphql(
  trend: EnergyPriceTrend,
): EnergyPriceTrendGraphqlType {
  const dto = new EnergyPriceTrendGraphqlType();
  dto.kind = trend.kind;
  dto.points = trend.points.map(toEnergyPriceGraphql);
  dto.simpleTrend = trendToGql[trend.simpleTrend];
  return dto;
}
