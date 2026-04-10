import type { EnergyPriceKind, EnergyPriceTrend } from '../../types/api';
import { graphqlHttpClient } from './client';
import { ENERGY_PRICE_TREND_QUERY } from './graphql/pricing';

export interface EnergyPriceTrendVariables {
  kind: EnergyPriceKind;
  limit: number;
}

interface EnergyPriceTrendResponse {
  energyPriceTrend: EnergyPriceTrend;
}

export async function fetchEnergyPriceTrend(
  variables: EnergyPriceTrendVariables,
): Promise<EnergyPriceTrend> {
  const data = await graphqlHttpClient.request<EnergyPriceTrendResponse>(
    ENERGY_PRICE_TREND_QUERY,
    variables,
  );
  return data.energyPriceTrend;
}
