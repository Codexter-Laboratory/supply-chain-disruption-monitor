import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@ArgsType()
export class RecentNewsArgs {
  @Field(() => Int, { defaultValue: 30 })
  @IsInt()
  @Min(1)
  @Max(200)
  limit!: number;
}
