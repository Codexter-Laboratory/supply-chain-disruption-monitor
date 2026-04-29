import { Query, Resolver } from '@nestjs/graphql';
import { VesselTrackingStatusStore } from '../application/vessel-tracking-status.store';
import { VesselTrackingHealthGql } from './vessel-tracking-health.graphql-types';
import { mapVesselTrackingHealthToGql } from './vessel-tracking-health.mapper';

@Resolver()
export class VesselTrackingHealthResolver {
  constructor(private readonly status: VesselTrackingStatusStore) {}

  @Query(() => VesselTrackingHealthGql, { name: 'vesselTrackingHealth' })
  vesselTrackingHealth(): VesselTrackingHealthGql {
    return mapVesselTrackingHealthToGql(this.status.getSnapshot());
  }
}
