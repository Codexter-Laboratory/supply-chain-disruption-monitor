import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('RouteLeg')
export class RouteLegGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  shipId!: string;

  @Field()
  originPort!: string;

  @Field()
  destinationPort!: string;

  @Field()
  departureDate!: Date;

  @Field()
  estimatedArrival!: Date;

  @Field()
  openedAt!: Date;

  @Field(() => Date, { nullable: true })
  closedAt!: Date | null;

  @Field()
  sequence!: number;
}
