import { memo, useMemo } from 'react';
import Map from 'react-map-gl/mapbox';
import { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ShipMapPoint } from '../types';
import { ShipMarker } from './ShipMarker';

const HORMUZ_VIEW = {
  longitude: 56.35,
  latitude: 26.28,
  zoom: 5.2,
} as const;

export type ShipMapProps = {
  points: ShipMapPoint[];
  mapboxToken: string | undefined;
  isLoading: boolean;
  error: Error | null;
};

export const ShipMap = memo(function ShipMap({
  points,
  mapboxToken,
  isLoading,
  error,
}: ShipMapProps) {
  const initialViewState = useMemo(() => ({ ...HORMUZ_VIEW }), []);

  if (!mapboxToken?.trim()) {
    return (
      <div className="ship-map ship-map--config">
        <p className="state-message state-message--empty">
          Set <code className="mono">VITE_MAPBOX_TOKEN</code> in{' '}
          <code className="mono">.env</code> to load the fleet map.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ship-map ship-map--error">
        <p className="state-message state-message--error">
          {error.message || 'Could not load ship positions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="ship-map">
      {isLoading && points.length === 0 ? (
        <div className="ship-map__loading state-message state-message--loading">
          <span className="spinner" aria-hidden />
          Loading fleet positions…
        </div>
      ) : null}
      <Map
        reuseMaps
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
      >
        {points.map((p) => (
          <Marker
            key={p.id}
            longitude={p.longitude}
            latitude={p.latitude}
            anchor="center"
          >
            <ShipMarker
              position={{
                latitude: p.latitude,
                longitude: p.longitude,
              }}
              status={p.status}
              title={p.id}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
});
