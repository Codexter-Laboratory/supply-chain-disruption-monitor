import { useMemo } from 'react';
import type { ShipMapFeatureCollection, ShipMapPoint } from '../types';

const EMPTY: ShipMapFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

/**
 * Memoized GeoJSON for map-native clustering. O(n) when `points` identity changes;
 * updates flow from subscription state without HTTP refetch.
 */
export function useShipMapFeatureCollection(
  points: ShipMapPoint[],
): ShipMapFeatureCollection {
  return useMemo(() => {
    if (points.length === 0) return EMPTY;
    return {
      type: 'FeatureCollection',
      features: points.map((p) => ({
        type: 'Feature' as const,
        id: p.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [p.longitude, p.latitude] as [number, number],
        },
        properties: {
          id: p.id,
          status: p.status,
        },
      })),
    };
  }, [points]);
}
