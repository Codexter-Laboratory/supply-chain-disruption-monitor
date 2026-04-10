import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

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
}
