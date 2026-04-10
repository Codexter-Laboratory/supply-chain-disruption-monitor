import { Field, ID, ObjectType } from '@nestjs/graphql';

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
}

@ObjectType('SupplyChainEventCreatedPayload')
export class SupplyChainEventCreatedPayloadGraphqlType {
  @Field(() => Date)
  occurredAt!: Date;

  @Field(() => ID)
  eventId!: string;

  @Field(() => ID)
  shipId!: string;

  @Field()
  type!: string;
}
