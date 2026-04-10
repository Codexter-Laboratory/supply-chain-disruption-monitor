import type { ShipPage } from '../../types/api';
import { graphqlHttpClient } from './client';
import { SHIPS_PAGE_QUERY } from './graphql/ships';

export interface ShipsPageVariables {
  offset: number;
  limit: number;
}

interface ShipsPageResponse {
  ships: ShipPage;
}

export async function fetchShipsPage(
  variables: ShipsPageVariables,
): Promise<ShipPage> {
  const data = await graphqlHttpClient.request<ShipsPageResponse>(
    SHIPS_PAGE_QUERY,
    variables,
  );
  return data.ships;
}
