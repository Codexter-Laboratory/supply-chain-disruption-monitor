import { CommodityType } from '@supply-chain/maritime-intelligence';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EnergyPrice')
export class EnergyPriceGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => CommodityType)
  type!: CommodityType;

  @Field()
  value!: string;

  @Field()
  timestamp!: Date;
}
