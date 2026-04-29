import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VesselTrackingProviderHealthGql {
  @Field(() => String) providerName!: string;

  @Field(() => Boolean) configured!: boolean;

  @Field(() => Date, { nullable: true }) lastAttemptAt!: Date | null;

  @Field(() => Date, { nullable: true }) lastSuccessAt!: Date | null;

  @Field(() => Date, { nullable: true }) lastFailureAt!: Date | null;

  @Field(() => String, { nullable: true }) lastErrorMessage!: string | null;

  @Field(() => Int) knownImosRequested!: number;

  @Field(() => Int) recordsReceived!: number;

  @Field(() => Int) recordsNormalized!: number;

  @Field(() => Int) recordsReturned!: number;

  @Field(() => Int) recordsSkipped!: number;
}

@ObjectType()
export class VesselTrackingIngestionHealthGql {
  @Field(() => Date, { nullable: true }) lastIngestionAttemptAt!: Date | null;

  @Field(() => Date, { nullable: true }) lastIngestionSuccessAt!: Date | null;

  @Field(() => Date, { nullable: true }) lastIngestionFailureAt!: Date | null;

  @Field(() => String, { nullable: true }) lastIngestionErrorMessage!: string | null;

  @Field(() => Int) lastPositionsApplied!: number;

  @Field(() => Int) lastPositionsSkipped!: number;

  @Field(() => Int) lastProviderObservations!: number;
}

@ObjectType()
export class VesselTrackingHealthGql {
  @Field(() => String) mode!: string;

  @Field(() => VesselTrackingProviderHealthGql) provider!: VesselTrackingProviderHealthGql;

  @Field(() => VesselTrackingIngestionHealthGql) ingestion!: VesselTrackingIngestionHealthGql;
}
