import { useEffect, useState } from 'react';
import type { ShipOperationalStatus } from '../../../types/api';
import { getGraphqlWsClient } from '../../../services/api/client';
import {
  SHIP_STATUS_CHANGED_SUBSCRIPTION,
  SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION,
} from '../../../services/api/graphql/ships';
import type { ShipMapPoint } from '../types';

function isShipStatus(s: string): s is ShipOperationalStatus {
  return (
    s === 'MOVING' ||
    s === 'WAITING' ||
    s === 'BLOCKED' ||
    s === 'DELAYED'
  );
}

/**
 * Keeps map points in sync via GraphQL subscriptions — no refetch.
 * - `shipStatusChanged`: patches `status` for the matching ship.
 * - `supplyChainEventCreated`: subscribed for parity with the dashboard; payload has no coordinates,
 *   so positions are unchanged until the next `dataUpdatedAt` refresh from `useShipsMapData`.
 */
export function useShipRealtimeMap(
  initialPoints: ShipMapPoint[],
  dataUpdatedAt: number,
): { points: ShipMapPoint[] } {
  const [points, setPoints] = useState<ShipMapPoint[]>([]);

  useEffect(() => {
    setPoints(initialPoints);
  }, [dataUpdatedAt, initialPoints]);

  useEffect(() => {
    const client = getGraphqlWsClient();
    const disposeStatus = client.subscribe(
      { query: SHIP_STATUS_CHANGED_SUBSCRIPTION },
      {
        next: (result) => {
          const payload = result.data?.shipStatusChanged as
            | { shipId: string; newStatus: string }
            | undefined;
          if (!payload || !isShipStatus(payload.newStatus)) return;
          setPoints((prev) =>
            prev.map((p) =>
              p.id === payload.shipId ? { ...p, status: payload.newStatus } : p,
            ),
          );
        },
        error: () => {},
        complete: () => {},
      },
    );

    const disposeEvents = client.subscribe(
      { query: SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION },
      {
        // Payload has no coordinates; map positions refresh on `dataUpdatedAt` from HTTP only.
        next: () => {},
        error: () => {},
        complete: () => {},
      },
    );

    return () => {
      disposeStatus();
      disposeEvents();
    };
  }, []);

  return { points };
}
