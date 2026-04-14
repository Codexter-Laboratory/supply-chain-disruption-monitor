import type { KpiSnapshot } from '../../types/api';
import { getGraphqlWsClient, graphqlHttpClient } from './client';
import {
  GET_KPI_SNAPSHOT_QUERY,
  KPI_UPDATED_SUBSCRIPTION,
} from '../../lib/graphql/kpi';

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
  const s = data.getKpiSnapshot;
  return {
    ...s,
    alerts: Array.isArray(s.alerts) ? s.alerts : [],
  };
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
          handlers.next({
            ...snap,
            alerts: Array.isArray(snap.alerts) ? snap.alerts : [],
          });
        }
      },
      error: handlers.error ?? (() => {}),
      complete: handlers.complete ?? (() => {}),
    },
  );
}

export type { KpiSnapshot };
