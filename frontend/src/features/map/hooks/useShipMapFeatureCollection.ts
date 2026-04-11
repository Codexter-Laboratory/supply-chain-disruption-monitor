import { useMemo } from 'react';
import type { ShipMapFeatureCollection, ShipMapPoint } from '../types';

const EMPTY: ShipMapFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const EMPTY_HIGHLIGHTS = new Set<string>();

/**
 * Memoized GeoJSON for map-native clustering. O(n) when `points` or highlights change;
 * updates flow from subscription state without HTTP refetch.
 */
export function useShipMapFeatureCollection(
  points: ShipMapPoint[],
  highlightedShipIds: ReadonlySet<string> = EMPTY_HIGHLIGHTS,
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
          recentlyUpdated: highlightedShipIds.has(p.id) ? 1 : 0,
        },
      })),
    };
  }, [points, highlightedShipIds]);
}
