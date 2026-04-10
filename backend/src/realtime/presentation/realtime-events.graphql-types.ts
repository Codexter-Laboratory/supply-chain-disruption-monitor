import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

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
