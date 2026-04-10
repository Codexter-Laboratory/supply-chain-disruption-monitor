import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EnergyPriceKindGql } from './energy-price.graphql-types';

@ArgsType()
export class RecentEnergyPricesArgs {
  @Field(() => Int, { defaultValue: 50 })
  @IsInt()
  @Min(1)
  @Max(200)
  limit!: number;

  @Field(() => EnergyPriceKindGql, { nullable: true })
  @IsOptional()
  @IsEnum(EnergyPriceKindGql)
  type?: EnergyPriceKindGql;
}

@ArgsType()
export class EnergyPriceTrendArgs {
  @Field(() => EnergyPriceKindGql)
  @IsEnum(EnergyPriceKindGql)
  kind!: EnergyPriceKindGql;

  @Field(() => Int, { defaultValue: 24 })
  @IsInt()
  @Min(2)
  @Max(500)
  limit!: number;
}
