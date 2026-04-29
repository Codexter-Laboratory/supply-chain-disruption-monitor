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

function normalizeKpiAlerts(s: KpiSnapshot): KpiSnapshot {
  return {
    ...s,
    alerts: Array.isArray(s.alerts) ? s.alerts : [],
  };
}

export async function getKpiSnapshot(): Promise<KpiSnapshot> {
  const data = await graphqlHttpClient.request<GetKpiSnapshotResponse>(
    GET_KPI_SNAPSHOT_QUERY,
  );
  return normalizeKpiAlerts(data.getKpiSnapshot);
}

/**
 * Resolves churn when HTTP and GraphQL subscriptions both update the same cache:
 * whoever has the newer `computedAt` wins (older snapshots must not replace newer live data).
 */
export function mergeNewerKpiSnapshot(
  previous: KpiSnapshot | undefined,
  incoming: KpiSnapshot,
): KpiSnapshot {
  const next = normalizeKpiAlerts(incoming);
  if (previous === undefined) {
    return next;
  }
  const prev = normalizeKpiAlerts(previous);
  const tNext = Date.parse(next.computedAt);
  const tPrev = Date.parse(prev.computedAt);
  const incomingOk = Number.isFinite(tNext);
  const previousOk = Number.isFinite(tPrev);
  if (!incomingOk && previousOk) {
    return prev;
  }
  if (incomingOk && !previousOk) {
    return next;
  }
  if (!incomingOk && !previousOk) {
    return next;
  }
  return tNext >= tPrev ? next : prev;
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
          handlers.next(normalizeKpiAlerts(snap));
        }
      },
      error: handlers.error ?? (() => {}),
      complete: handlers.complete ?? (() => {}),
    },
  );
}

export type { KpiSnapshot };
