import { getGraphqlWsClient, graphqlHttpClient } from './client';
import {
  GET_KPI_SNAPSHOT_QUERY,
  KPI_UPDATED_SUBSCRIPTION,
} from '../../lib/graphql/kpi';

export interface KpiMaritimeSlice {
  readonly totalVessels: number;
  readonly delayedVessels: number;
  readonly averageDelayTimeHours: number;
}

export interface KpiFinancialSlice {
  readonly totalCargoValue: number;
  readonly estimatedOilValue: number;
  readonly estimatedLngValue: number;
}

export interface KpiSnapshot {
  readonly computedAt: string;
  readonly maritime: KpiMaritimeSlice;
  readonly financial: KpiFinancialSlice;
}

interface GetKpiSnapshotResponse {
  getKpiSnapshot: KpiSnapshot;
}

interface KpiUpdatedMessage {
  kpiUpdated?: KpiSnapshot;
}

export async function getKpiSnapshot(): Promise<KpiSnapshot> {
  const data = await graphqlHttpClient.request<GetKpiSnapshotResponse>(
    GET_KPI_SNAPSHOT_QUERY,
  );
  return data.getKpiSnapshot;
}

export interface KpiUpdatedHandlers {
  readonly next: (snapshot: KpiSnapshot) => void;
  readonly error?: (err: unknown) => void;
  readonly complete?: () => void;
}

/** WebSocket subscription; returns dispose. */
export function subscribeKpiUpdated(handlers: KpiUpdatedHandlers): () => void {
  const client = getGraphqlWsClient();
  return client.subscribe<KpiUpdatedMessage>(
    { query: KPI_UPDATED_SUBSCRIPTION },
    {
      next: (result) => {
        const snap = result.data?.kpiUpdated;
        if (snap) {
          handlers.next(snap);
        }
      },
      error: handlers.error ?? (() => {}),
      complete: handlers.complete ?? (() => {}),
    },
  );
}
