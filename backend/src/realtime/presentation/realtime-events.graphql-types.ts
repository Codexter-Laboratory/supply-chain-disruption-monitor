import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { EnergyPriceKindGql } from '../../pricing/presentation/energy-price.graphql-types';

@ObjectType('ShipStatusChangedPayload')
export class ShipStatusChangedPayloadGraphqlType {
  @Field(() => Date)
  occurredAt!: Date;

  @Field(() => ID)
  shipId!: string;

  @Field()
  previousStatus!: string;

  @Field()
  newStatus!: string;

  @Field(() => Float)
  latitude!: number;

  @Field(() => Float)
  longitude!: number;
}

@ObjectType('EnergyPriceUpdatedPayload')
export class EnergyPriceUpdatedPayloadGraphqlType {
  @Field(() => Date)
  occurredAt!: Date;

  @Field(() => ID)
  priceId!: string;

  @Field(() => EnergyPriceKindGql)
  kind!: EnergyPriceKindGql;

  @Field()
  value!: string;
}

@ObjectType('SupplyChainEventCreatedPayload')
export class SupplyChainEventCreatedPayloadGraphqlType {
  @Field(() => Date)
  occurredAt!: Date;

  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  shipId!: string;

  @Field()
  type!: string;

  @Field(() => Float, { nullable: true })
  latitude!: number | null;

  @Field(() => Float, { nullable: true })
  longitude!: number | null;

  @Field(() => String, { nullable: true })
  region!: string | null;
}
