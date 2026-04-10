import { ArgsType, Field, Float, ID, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@ArgsType()
export class ShipByIdArgs {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  id!: string;
}

@ArgsType()
export class ShipsPageArgs {
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  offset!: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}

@ArgsType()
export class ShipsInBoundingBoxArgs {
  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  minLat!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  maxLat!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  minLng!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  maxLng!: number;
}
