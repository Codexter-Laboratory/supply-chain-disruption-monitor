import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum SupplyChainEventKindGql {
  DELAY = 'DELAY',
  INCIDENT = 'INCIDENT',
  REROUTE = 'REROUTE',
  CLEARANCE = 'CLEARANCE',
}

registerEnumType(SupplyChainEventKindGql, { name: 'SupplyChainEventKind' });

@ObjectType('SupplyChainEvent')
export class SupplyChainEventGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  shipId!: string;

  @Field(() => ID, { nullable: true })
  routeLegId!: string | null;

  @Field(() => SupplyChainEventKindGql)
  type!: SupplyChainEventKindGql;

  @Field()
  timestamp!: Date;

  @Field()
  description!: string;

  @Field(() => Float, { nullable: true })
  latitude!: number | null;

  @Field(() => Float, { nullable: true })
  longitude!: number | null;

  @Field({ nullable: true })
  region!: string | null;
}
