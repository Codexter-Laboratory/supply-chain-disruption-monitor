import { CommodityType } from '@supply-chain/maritime-intelligence';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EnergyPriceGraphqlType } from './energy-price.graphql-types';

export enum TrendDirectionGql {
  UP = 'UP',
  DOWN = 'DOWN',
  FLAT = 'FLAT',
}

registerEnumType(TrendDirectionGql, { name: 'EnergyPriceTrendDirection' });

@ObjectType('EnergyPriceTrend')
export class EnergyPriceTrendGraphqlType {
  @Field(() => CommodityType)
  kind!: CommodityType;

  @Field(() => [EnergyPriceGraphqlType])
  points!: EnergyPriceGraphqlType[];

  @Field(() => TrendDirectionGql)
  simpleTrend!: TrendDirectionGql;
}
