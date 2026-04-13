import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VesselsByTypeCountsGql {
  @Field(() => Int) CRUDE_TANKER!: number;
  @Field(() => Int) LNG_CARRIER!: number;
  @Field(() => Int) LPG_CARRIER!: number;
  @Field(() => Int) PRODUCT_TANKER!: number;
  @Field(() => Int) CHEMICAL_TANKER!: number;
  @Field(() => Int) CONTAINER!: number;
  @Field(() => Int) BULK!: number;
}

@ObjectType()
export class CargoVolumeByTypeGql {
  @Field(() => Float) CRUDE_OIL!: number;
  @Field(() => Float) LNG!: number;
  @Field(() => Float) LPG!: number;
  @Field(() => Float) REFINED_PRODUCTS!: number;
  @Field(() => Float) PETROCHEMICALS!: number;
  @Field(() => Float) DRY_BULK!: number;
  @Field(() => Float) CONTAINER_GOODS!: number;
}

@ObjectType()
export class CargoValueByTypeGql {
  @Field(() => Float) CRUDE_OIL!: number;
  @Field(() => Float) LNG!: number;
  @Field(() => Float) LPG!: number;
  @Field(() => Float) REFINED_PRODUCTS!: number;
  @Field(() => Float) PETROCHEMICALS!: number;
  @Field(() => Float) DRY_BULK!: number;
  @Field(() => Float) CONTAINER_GOODS!: number;
}

@ObjectType()
export class MaritimeKpisGraphqlType {
  @Field(() => Int) totalVessels!: number;
  @Field(() => Int) delayedVessels!: number;
  @Field(() => VesselsByTypeCountsGql) vesselsByType!: VesselsByTypeCountsGql;
  @Field(() => VesselsByTypeCountsGql) delayedVesselsByType!: VesselsByTypeCountsGql;
  @Field(() => Float) totalDeadweightTonnage!: number;
  @Field(() => Float) totalLNGVolume!: number;
  @Field(() => Float) totalDelayHours!: number;
  @Field(() => Float) averageDelayTimeHours!: number;
  @Field(() => CargoVolumeByTypeGql) volumeByCargoType!: CargoVolumeByTypeGql;
}

@ObjectType()
export class FinancialKpisGraphqlType {
  @Field(() => Float) estimatedOilValue!: number;
  @Field(() => Float) estimatedLngValue!: number;
  @Field(() => Float) totalCargoValue!: number;
  @Field(() => CargoValueByTypeGql) valueByCargoType!: CargoValueByTypeGql;
}

@ObjectType('KpiSnapshot')
export class KpiSnapshotGraphqlType {
  @Field(() => MaritimeKpisGraphqlType) maritime!: MaritimeKpisGraphqlType;
  @Field(() => FinancialKpisGraphqlType) financial!: FinancialKpisGraphqlType;
  @Field() computedAt!: string;
}
