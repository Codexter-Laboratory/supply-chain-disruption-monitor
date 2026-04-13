import { Inject } from '@nestjs/common';
import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../../realtime/application/pub-sub.token';
import { KPI_UPDATED_TOPIC } from '../../realtime/application/realtime-topics';
import type { KpiSnapshot } from '../domain/kpi.types';
import { KpiOrchestratorService } from '../application/kpi-orchestrator.service';
import { kpiSnapshotToGraphql } from './kpi.dto-mapper';
import { KpiSnapshotGraphqlType } from './kpi.graphql-types';

@Resolver()
export class KpiResolver {
  constructor(
    private readonly orchestrator: KpiOrchestratorService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => KpiSnapshotGraphqlType, { name: 'getKpiSnapshot' })
  async getKpiSnapshot(): Promise<KpiSnapshotGraphqlType> {
    const snapshot = await this.orchestrator.getSnapshotOrComputeOnce();
    return kpiSnapshotToGraphql(snapshot);
  }

  @Subscription(() => KpiSnapshotGraphqlType, {
    name: 'kpiUpdated',
    resolve: (payload: { kpiUpdated: KpiSnapshot }) =>
      kpiSnapshotToGraphql(payload.kpiUpdated),
  })
  kpiUpdated() {
    return this.pubSub.asyncIterator(KPI_UPDATED_TOPIC);
  }
}
