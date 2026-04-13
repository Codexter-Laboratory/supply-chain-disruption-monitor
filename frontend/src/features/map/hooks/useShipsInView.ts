import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Ship } from '../../../types/api';
import { getShipsInView } from '../../../services/api/ships.api';
import type { MapViewportBounds, ShipMapPoint } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

const EMPTY_POINTS: ShipMapPoint[] = [];
const DEBOUNCE_MS = 380;

function toShipMapPoint(ship: Ship): ShipMapPoint {
  return {
    id: ship.id,
    latitude: ship.latitude,
    longitude: ship.longitude,
    status: ship.currentStatus,
  };
}

function isQueryableBounds(b: MapViewportBounds): boolean {
  return (
    Number.isFinite(b.west) &&
    Number.isFinite(b.south) &&
    Number.isFinite(b.east) &&
    Number.isFinite(b.north) &&
    b.south <= b.north &&
    b.west <= b.east
  );
}

/**
 * Loads ships for the current map viewport only. Bounds are debounced to limit requests while
 * panning/zooming; previous data is kept as placeholder to reduce flicker.
 */
export function useShipsInView(rawBounds: MapViewportBounds | null) {
  const debouncedBounds = useDebouncedValue(rawBounds, DEBOUNCE_MS);

  const query = useQuery({
    queryKey: [
      'ships',
      'inView',
      debouncedBounds?.west,
      debouncedBounds?.south,
      debouncedBounds?.east,
      debouncedBounds?.north,
    ] as const,
    queryFn: () => {
      if (debouncedBounds == null) {
        return Promise.resolve([]);
      }
      return getShipsInView({
        minLat: debouncedBounds.south,
        maxLat: debouncedBounds.north,
        minLng: debouncedBounds.west,
        maxLng: debouncedBounds.east,
      });
    },
    enabled:
      debouncedBounds != null && isQueryableBounds(debouncedBounds),
    staleTime: 45_000,
    placeholderData: (previousData) => previousData,
  });

  const points = useMemo(() => {
    if (!query.data?.length) return EMPTY_POINTS;
    return query.data.map(toShipMapPoint);
  }, [query.data]);

  return {
    points,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
