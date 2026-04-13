import { useEffect, useRef, useState } from 'react';
import type { ShipOperationalStatus } from '../../../types/api';
import { subscribeShipStatusChanged } from '../../../services/api/ships.api';
import { queryClient } from '../../../app/queryClient';
import type { ShipPage } from '../../../types/api';

const FLASH_MS = 1800;

function isShipStatus(s: string): s is ShipOperationalStatus {
  return (
    s === 'MOVING' ||
    s === 'WAITING' ||
    s === 'BLOCKED' ||
    s === 'DELAYED'
  );
}

/**
 * Patches cached ship pages when a subscription payload arrives — no list refetch.
 * Exposes `flashShipId` so the UI can briefly highlight the updated row.
 */
export function useShipStatusSubscription(): { flashShipId: string | null } {
  const [flashShipId, setFlashShipId] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dispose = subscribeShipStatusChanged({
      next: (payload) => {
        if (!isShipStatus(payload.newStatus)) {
          return;
        }
        if (
          !Number.isFinite(payload.latitude) ||
          !Number.isFinite(payload.longitude)
        ) {
          return;
        }
        const newStatus = payload.newStatus;
        queryClient.setQueriesData<ShipPage>(
          { queryKey: ['ships'] },
          (old) => {
            if (!old) return old;
            const nextItems = old.items.map((ship) =>
              ship.id === payload.shipId
                ? {
                    ...ship,
                    currentStatus: newStatus,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                  }
                : ship,
            );
            return { ...old, items: nextItems };
          },
        );
        if (flashTimerRef.current) {
          clearTimeout(flashTimerRef.current);
        }
        setFlashShipId(payload.shipId);
        flashTimerRef.current = setTimeout(() => {
          setFlashShipId(null);
          flashTimerRef.current = null;
        }, FLASH_MS);
      },
      error: () => {
        /* subscription transport errors are non-fatal for dashboard */
      },
      complete: () => {},
    });
    return () => {
      dispose();
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  return { flashShipId };
}
