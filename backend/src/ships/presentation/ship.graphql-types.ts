import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ShipCargoTypeGql {
  OIL = 'OIL',
  LNG = 'LNG',
  CONTAINER = 'CONTAINER',
  BULK = 'BULK',
  OTHER = 'OTHER',
}

export enum ShipOperationalStatusGql {
  MOVING = 'MOVING',
  WAITING = 'WAITING',
  BLOCKED = 'BLOCKED',
  DELAYED = 'DELAYED',
}

registerEnumType(ShipCargoTypeGql, { name: 'ShipCargoType' });
registerEnumType(ShipOperationalStatusGql, { name: 'ShipOperationalStatus' });

@ObjectType('Ship')
export class ShipGraphqlType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  imo!: string;

  @Field()
  country!: string;

  @Field(() => Float)
  latitude!: number;

  @Field(() => Float)
  longitude!: number;

  @Field()
  originCountry!: string;

  @Field()
  destinationCountry!: string;

  @Field()
  ownerCompany!: string;

  @Field(() => ShipCargoTypeGql)
  cargoType!: ShipCargoTypeGql;

  @Field()
  capacity!: string;

  @Field(() => ShipOperationalStatusGql)
  currentStatus!: ShipOperationalStatusGql;
}
