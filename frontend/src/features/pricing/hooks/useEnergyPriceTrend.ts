import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommodityType } from '../../../types/api';
import {
  fetchEnergyPriceTrend,
  subscribeEnergyPriceUpdated,
} from '../../../services/api/pricing';
import { DEFAULT_ENERGY_TREND_COMMODITY } from '../pricing.constants';

const POINT_LIMIT = 32;

/** WebSocket: refetch trend when server records a new price for this kind. */
export function useEnergyPriceTrendSubscription(kind: CommodityType): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeEnergyPriceUpdated({
      next: (payload) => {
        if (payload.kind !== kind) {
          return;
        }
        void queryClient.invalidateQueries({
          queryKey: ['energyPriceTrend', kind],
        });
      },
      error: () => {
        /* non-fatal */
      },
    });
  }, [kind, queryClient]);
}

/** Same as {@link useEnergyPriceTrendSubscription} (naming used in ops dashboards). */
export const usePricingSubscription = useEnergyPriceTrendSubscription;

export function useEnergyPriceTrend(
  kind: CommodityType = DEFAULT_ENERGY_TREND_COMMODITY,
) {
  useEnergyPriceTrendSubscription(kind);

  return useQuery({
    queryKey: ['energyPriceTrend', kind, POINT_LIMIT] as const,
    queryFn: () =>
      fetchEnergyPriceTrend({ kind, limit: POINT_LIMIT }),
  });
}
