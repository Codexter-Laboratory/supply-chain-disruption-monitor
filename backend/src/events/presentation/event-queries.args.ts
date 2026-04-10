import { ArgsType, Field, ID, Int } from '@nestjs/graphql';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

@ArgsType()
export class SupplyChainEventByIdArgs {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  id!: string;
}

@ArgsType()
export class RecentSupplyChainEventsArgs {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  shipId!: string;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}
