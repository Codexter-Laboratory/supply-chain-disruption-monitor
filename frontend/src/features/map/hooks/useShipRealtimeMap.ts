import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShipOperationalStatus } from '../../../types/api';
import { getGraphqlWsClient } from '../../../services/api/client';
import { SHIP_STATUS_CHANGED_SUBSCRIPTION } from '../../../services/api/graphql/ships';
import type { ShipMapPoint } from '../types';

const HIGHLIGHT_MS = 2000;

function isShipStatus(s: string): s is ShipOperationalStatus {
  return (
    s === 'MOVING' ||
    s === 'WAITING' ||
    s === 'BLOCKED' ||
    s === 'DELAYED'
  );
}

function shipPointChanged(a: ShipMapPoint, b: ShipMapPoint): boolean {
  return (
    a.status !== b.status ||
    a.latitude !== b.latitude ||
    a.longitude !== b.longitude
  );
}

/**
 * Map points: initial load from React Query; movement and status from `shipStatusChanged` only
 * (no refetch). Tracks ships whose position or status just changed for short-lived list/map hints.
 */
export function useShipRealtimeMap(
  initialPoints: ShipMapPoint[],
  dataUpdatedAt: number,
): { points: ShipMapPoint[]; highlightedShipIds: ReadonlySet<string> } {
  const [points, setPoints] = useState<ShipMapPoint[]>([]);
  const [highlightedShipIds, setHighlightedShipIds] = useState(
    () => new Set<string>(),
  );

  const prevByIdRef = useRef(new Map<string, ShipMapPoint>());
  const highlightTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );

  const clearHighlightTimer = useCallback((id: string) => {
    const t = highlightTimersRef.current.get(id);
    if (t !== undefined) {
      clearTimeout(t);
      highlightTimersRef.current.delete(id);
    }
  }, []);

  const addHighlight = useCallback(
    (id: string) => {
      clearHighlightTimer(id);
      const t = setTimeout(() => {
        highlightTimersRef.current.delete(id);
        setHighlightedShipIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, HIGHLIGHT_MS);
      highlightTimersRef.current.set(id, t);
      setHighlightedShipIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [clearHighlightTimer],
  );

  useEffect(() => {
    return () => {
      highlightTimersRef.current.forEach((timer) => clearTimeout(timer));
      highlightTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const prev = prevByIdRef.current;
    for (const p of initialPoints) {
      const old = prev.get(p.id);
      if (old && shipPointChanged(old, p)) {
        addHighlight(p.id);
      }
    }
    prevByIdRef.current = new Map(
      initialPoints.map((p) => [p.id, { ...p }]),
    );
    setPoints(initialPoints);
  }, [dataUpdatedAt, initialPoints, addHighlight]);

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
          const shipId = payload.shipId;
          const newPoint: ShipMapPoint = {
            id: shipId,
            status: payload.newStatus,
            latitude: payload.latitude,
            longitude: payload.longitude,
          };

          setPoints((prev) => {
            const i = prev.findIndex((p) => p.id === shipId);
            if (i === -1) return prev;
            const cur = prev[i]!;
            if (shipPointChanged(cur, newPoint)) {
              queueMicrotask(() => addHighlight(shipId));
            }
            const next = [...prev];
            next[i] = newPoint;
            prevByIdRef.current.set(shipId, newPoint);
            return next;
          });
        },
        error: () => {},
        complete: () => {},
      },
    );

    return () => {
      dispose();
    };
  }, [addHighlight]);

  return { points, highlightedShipIds };
}
