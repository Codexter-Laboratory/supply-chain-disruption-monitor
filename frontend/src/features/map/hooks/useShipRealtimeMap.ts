import { useEffect, useState } from 'react';
import type { ShipOperationalStatus } from '../../../types/api';
import { getGraphqlWsClient } from '../../../services/api/client';
import { SHIP_STATUS_CHANGED_SUBSCRIPTION } from '../../../services/api/graphql/ships';
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
 * Map points: initial load from React Query; movement and status from `shipStatusChanged` only
 * (no refetch). Payload includes authoritative lat/lng from the backend after each simulation tick.
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
    const dispose = client.subscribe(
      { query: SHIP_STATUS_CHANGED_SUBSCRIPTION },
      {
        next: (result) => {
          const payload = result.data?.shipStatusChanged as
            | {
                shipId: string;
                newStatus: string;
                latitude: number;
                longitude: number;
              }
            | undefined;
          if (!payload || !isShipStatus(payload.newStatus)) return;
          if (
            !Number.isFinite(payload.latitude) ||
            !Number.isFinite(payload.longitude)
          ) {
            return;
          }
          setPoints((prev) =>
            prev.map((p) =>
              p.id === payload.shipId
                ? {
                    ...p,
                    status: payload.newStatus,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                  }
                : p,
            ),
          );
        },
        error: () => {},
        complete: () => {},
      },
    );

    return () => {
      dispose();
    };
  }, []);

  return { points };
}
