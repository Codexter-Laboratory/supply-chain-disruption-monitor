import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchKpiSnapshot,
  subscribeToKpiUpdates,
  type KpiSnapshot,
} from '../api/kpi.api';

export const KPI_SNAPSHOT_QUERY_KEY = ['kpi', 'snapshot'] as const;

export interface UseKpiResult {
  readonly data: KpiSnapshot | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly isStale: boolean;
  readonly error: Error | null;
}

/**
 * Initial load via React Query; live updates via `kpiUpdated` → cache `setQueryData` (no refetch).
 */
export function useKpi(): UseKpiResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: KPI_SNAPSHOT_QUERY_KEY,
    queryFn: fetchKpiSnapshot,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const unsubscribe = subscribeToKpiUpdates({
      next: (snapshot) => {
        queryClient.setQueryData(KPI_SNAPSHOT_QUERY_KEY, snapshot);
      },
      error: () => {
        /* WS errors are non-fatal; cached snapshot remains */
      },
    });
    return unsubscribe;
  }, [queryClient]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isStale: query.isStale,
    error: query.error instanceof Error ? query.error : null,
  };
}
