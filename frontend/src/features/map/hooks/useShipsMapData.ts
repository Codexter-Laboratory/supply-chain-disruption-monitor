import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Ship } from '../../../types/api';
import { fetchShipsPage } from '../../../services/api/ships';
import type { ShipMapPoint } from '../types';

const PAGE_LIMIT = 100;

const EMPTY_POINTS: ShipMapPoint[] = [];

function toShipMapPoint(ship: Ship): ShipMapPoint {
  return {
    id: ship.id,
    latitude: ship.latitude,
    longitude: ship.longitude,
    status: ship.currentStatus,
  };
}

async function fetchAllShips(): Promise<Ship[]> {
  const all: Ship[] = [];
  let offset = 0;
  let page = await fetchShipsPage({ offset, limit: PAGE_LIMIT });
  all.push(...page.items);
  while (offset + page.items.length < page.total) {
    offset += PAGE_LIMIT;
    page = await fetchShipsPage({ offset, limit: PAGE_LIMIT });
    all.push(...page.items);
  }
  return all;
}

/**
 * Loads the full fleet for the map using the same `ships` query document as pagination,
 * walking pages until `total` is covered.
 */
export function useShipsMapData() {
  const query = useQuery({
    queryKey: ['ships', 'map', 'all'] as const,
    queryFn: fetchAllShips,
    staleTime: 60_000,
  });

  const points = useMemo(() => {
    if (query.data == null) return EMPTY_POINTS;
    if (query.data.length === 0) return EMPTY_POINTS;
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
