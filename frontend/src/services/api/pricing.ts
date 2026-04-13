import type { CommodityType, EnergyPriceTrend } from '../../types/api';
import { getGraphqlWsClient, graphqlHttpClient } from './client';
import {
  ENERGY_PRICE_TREND_QUERY,
  ENERGY_PRICE_UPDATED_SUBSCRIPTION,
} from '../../lib/graphql/pricing';

export interface EnergyPriceTrendVariables {
  kind: CommodityType;
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

export interface EnergyPriceUpdatedPayload {
  readonly occurredAt: string;
  readonly priceId: string;
  readonly kind: CommodityType;
  readonly value: string;
}

interface EnergyPriceUpdatedMessage {
  energyPriceUpdated?: EnergyPriceUpdatedPayload;
}

export interface EnergyPriceUpdatedHandlers {
  readonly next: (payload: EnergyPriceUpdatedPayload) => void;
  readonly error?: (err: unknown) => void;
  readonly complete?: () => void;
}

export function subscribeEnergyPriceUpdated(
  handlers: EnergyPriceUpdatedHandlers,
): () => void {
  const client = getGraphqlWsClient();
  return client.subscribe<EnergyPriceUpdatedMessage>(
    { query: ENERGY_PRICE_UPDATED_SUBSCRIPTION },
    {
      next: (result) => {
        const p = result.data?.energyPriceUpdated;
        if (p) {
          handlers.next(p);
        }
      },
      error: handlers.error ?? (() => {}),
      complete: handlers.complete ?? (() => {}),
    },
  );
}
