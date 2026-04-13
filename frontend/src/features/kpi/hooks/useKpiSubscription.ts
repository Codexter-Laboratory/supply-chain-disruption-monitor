import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeKpiUpdated } from '../../../services/api/kpi.api';
import { KPI_SNAPSHOT_QUERY_KEY } from '../kpi.constants';

/**
 * Pushes `kpiUpdated` into the React Query cache; does not refetch.
 */
export function useKpiSubscription(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeKpiUpdated({
      next: (snapshot) => {
        queryClient.setQueryData(KPI_SNAPSHOT_QUERY_KEY, snapshot);
      },
      error: () => {
        /* non-fatal */
      },
    });
  }, [queryClient]);
}
