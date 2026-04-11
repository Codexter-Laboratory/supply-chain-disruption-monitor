/** WGS-84 bounds from the map viewport (Mapbox `LngLatBounds`). */
export type MapViewportBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

/** Map view model derived from GraphQL `Ship` in hooks (not wire types). */
export type ShipMapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
};

/** GeoJSON passed to Mapbox `Source` (clustering); built only in hooks. */
export type ShipMapFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: { id: string; status: string };
  }>;
};
