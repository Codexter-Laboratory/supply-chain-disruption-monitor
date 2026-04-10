import { useQuery } from '@tanstack/react-query';
import type { EnergyPriceKind } from '../../../types/api';
import { fetchEnergyPriceTrend } from '../../../services/api/pricing';

const DEFAULT_KIND: EnergyPriceKind = 'OIL';
const POINT_LIMIT = 32;

export function useEnergyPriceTrend(kind: EnergyPriceKind = DEFAULT_KIND) {
  return useQuery({
    queryKey: ['energyPriceTrend', kind, POINT_LIMIT] as const,
    queryFn: () =>
      fetchEnergyPriceTrend({ kind, limit: POINT_LIMIT }),
  });
}
