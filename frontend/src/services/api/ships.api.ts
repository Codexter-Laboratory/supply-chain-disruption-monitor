import type {
  Ship,
  ShipPage,
  SupplyChainEventCreatedPayload,
} from '../../types/api';
import {
  SHIP_STATUS_CHANGED_SUBSCRIPTION,
  SHIPS_IN_VIEW_QUERY,
  SHIPS_PAGE_QUERY,
  SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION,
} from '../../lib/graphql/ships';
import { getGraphqlWsClient, graphqlHttpClient } from './client';

export interface GetShipsPageParams {
  readonly offset: number;
  readonly limit: number;
}

interface ShipsPageResponse {
  ships: ShipPage;
}

interface ShipsInViewResponse {
  shipsInView: Ship[];
}

export async function getShipsInView(bounds: {
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

export async function getShipsPage(
  params: GetShipsPageParams,
): Promise<ShipPage> {
  const data = await graphqlHttpClient.request<ShipsPageResponse>(
    SHIPS_PAGE_QUERY,
    params,
  );
  return data.ships;
}

export interface ShipStatusChangedPayload {
  readonly occurredAt: string;
  readonly shipId: string;
  readonly previousStatus: string;
  readonly newStatus: string;
  readonly latitude: number;
  readonly longitude: number;
}

interface ShipStatusSubscriptionData {
  shipStatusChanged?: ShipStatusChangedPayload;
}

export interface ShipStatusSubscriptionHandlers {
  readonly next: (payload: ShipStatusChangedPayload) => void;
  readonly error?: (err: unknown) => void;
  readonly complete?: () => void;
}

export function subscribeShipStatusChanged(
  handlers: ShipStatusSubscriptionHandlers,
): () => void {
  const client = getGraphqlWsClient();
  return client.subscribe<ShipStatusSubscriptionData>(
    { query: SHIP_STATUS_CHANGED_SUBSCRIPTION },
    {
      next: (result) => {
        const p = result.data?.shipStatusChanged;
        if (p) {
          handlers.next(p);
        }
      },
      error: handlers.error ?? (() => {}),
      complete: handlers.complete ?? (() => {}),
    },
  );
}

interface SupplyChainEventSubscriptionData {
  supplyChainEventCreated?: SupplyChainEventCreatedPayload;
}

export interface SupplyChainEventSubscriptionHandlers {
  readonly next: (payload: SupplyChainEventCreatedPayload) => void;
  readonly error?: (err: unknown) => void;
  readonly complete?: () => void;
}

export function subscribeSupplyChainEventCreated(
  handlers: SupplyChainEventSubscriptionHandlers,
): () => void {
  const client = getGraphqlWsClient();
  return client.subscribe<SupplyChainEventSubscriptionData>(
    { query: SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION },
    {
      next: (result) => {
        const row = result.data?.supplyChainEventCreated;
        if (row) {
          handlers.next(row);
        }
      },
      error: handlers.error ?? (() => {}),
      complete: handlers.complete ?? (() => {}),
    },
  );
}
