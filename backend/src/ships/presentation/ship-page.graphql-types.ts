import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ShipGraphqlType } from './ship.graphql-types';

@ObjectType('ShipPage')
export class ShipPageGraphqlType {
  @Field(() => [ShipGraphqlType])
  items!: ShipGraphqlType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  offset!: number;

  @Field(() => Int)
  limit!: number;
}
