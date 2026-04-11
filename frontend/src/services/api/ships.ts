import type { Ship, ShipPage } from '../../types/api';
import { graphqlHttpClient } from './client';
import { SHIPS_IN_VIEW_QUERY, SHIPS_PAGE_QUERY } from './graphql/ships';

export interface ShipsPageVariables {
  offset: number;
  limit: number;
}

interface ShipsPageResponse {
  ships: ShipPage;
}

interface ShipsInViewResponse {
  shipsInView: Ship[];
}

export async function fetchShipsInView(bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}): Promise<Ship[]> {
  const data = await graphqlHttpClient.request<ShipsInViewResponse>(
    SHIPS_IN_VIEW_QUERY,
    bounds,
  );
  return data.shipsInView;
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
