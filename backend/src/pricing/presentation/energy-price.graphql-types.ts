import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum EnergyPriceKindGql {
  OIL = 'OIL',
  GAS = 'GAS',
}

registerEnumType(EnergyPriceKindGql, { name: 'EnergyPriceKind' });

@ObjectType('EnergyPrice')
export class EnergyPriceGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field(() => EnergyPriceKindGql)
  type!: EnergyPriceKindGql;

  @Field()
  value!: string;

  @Field()
  timestamp!: Date;
}
