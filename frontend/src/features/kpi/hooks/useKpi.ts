import { useQuery } from '@tanstack/react-query';
import { getKpiSnapshot, type KpiSnapshot } from '../../../services/api/kpi.api';
import { KPI_SNAPSHOT_QUERY_KEY } from '../kpi.constants';

export type { KpiSnapshot };

export interface UseKpiResult {
  readonly data: KpiSnapshot | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly isStale: boolean;
  readonly error: Error | null;
}

/** HTTP snapshot only; pair with {@link useKpiSubscription} for live updates. */
export function useKpi(): UseKpiResult {
  const query = useQuery({
    queryKey: KPI_SNAPSHOT_QUERY_KEY,
    queryFn: getKpiSnapshot,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isStale: query.isStale,
    error: query.error instanceof Error ? query.error : null,
  };
}
