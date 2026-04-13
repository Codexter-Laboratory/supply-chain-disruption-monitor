import { CommodityType } from '@supply-chain/maritime-intelligence';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

@ArgsType()
export class RecentEnergyPricesArgs {
  @Field(() => Int, { defaultValue: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit!: number;

  @Field(() => CommodityType, { nullable: true })
  @IsOptional()
  @IsEnum(CommodityType)
  type?: CommodityType;
}

@ArgsType()
export class EnergyPriceTrendArgs {
  @Field(() => CommodityType)
  @IsEnum(CommodityType)
  kind!: CommodityType;

  @Field(() => Int, { defaultValue: 24 })
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(500)
  limit!: number;
}
