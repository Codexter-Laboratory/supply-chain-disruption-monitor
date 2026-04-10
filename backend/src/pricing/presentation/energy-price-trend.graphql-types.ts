import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EnergyPriceGraphqlType, EnergyPriceKindGql } from './energy-price.graphql-types';

export enum TrendDirectionGql {
  UP = 'UP',
  DOWN = 'DOWN',
  FLAT = 'FLAT',
}

registerEnumType(TrendDirectionGql, { name: 'EnergyPriceTrendDirection' });

@ObjectType('EnergyPriceTrend')
export class EnergyPriceTrendGraphqlType {
  @Field(() => EnergyPriceKindGql)
  kind!: EnergyPriceKindGql;

  @Field(() => [EnergyPriceGraphqlType])
  points!: EnergyPriceGraphqlType[];

  @Field(() => TrendDirectionGql)
  simpleTrend!: TrendDirectionGql;
}
