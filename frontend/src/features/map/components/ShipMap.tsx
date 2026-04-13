import { memo, useCallback, useMemo } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import Map from 'react-map-gl/mapbox';
import { Layer, Source } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import feedback from '../../../styles/feedback.module.css';
import type { MapViewportBounds, ShipMapFeatureCollection } from '../types';
import {
  SHIP_SOURCE_ID,
  clusterCircleLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from './ship-cluster-layers';
import styles from './ShipMap.module.css';

const HORMUZ_VIEW = {
  longitude: 56.35,
  latitude: 26.28,
  zoom: 5.2,
} as const;

function readViewportBounds(map: MapboxMap): MapViewportBounds {
  const b = map.getBounds();
  if (!b) {
    return { west: -180, south: -90, east: 180, north: 90 };
  }
  return {
    west: b.getWest(),
    south: b.getSouth(),
    east: b.getEast(),
    north: b.getNorth(),
  };
}

export type ShipMapProps = {
  featureCollection: ShipMapFeatureCollection;
  mapboxToken: string | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  error: Error | null;
  /** Fired when the map reports its geographic bounds (load + after pan/zoom). No API calls here. */
  onViewportBoundsChange?: (bounds: MapViewportBounds) => void;
};

export const ShipMap = memo(function ShipMap({
  featureCollection,
  mapboxToken,
  isLoading,
  isRefreshing = false,
  error,
  onViewportBoundsChange,
}: ShipMapProps) {
  const initialViewState = useMemo(() => ({ ...HORMUZ_VIEW }), []);

  const emitBounds = useCallback(
    (map: MapboxMap) => {
      onViewportBoundsChange?.(readViewportBounds(map));
    },
    [onViewportBoundsChange],
  );

  const hasFeatures = featureCollection.features.length > 0;

  if (!mapboxToken?.trim()) {
    return (
      <div className={`${styles.map} ${styles.config}`}>
        <p className={feedback.stateMessageEmpty}>
          Set <code className="mono">VITE_MAPBOX_TOKEN</code> in{' '}
          <code className="mono">.env</code> to load the fleet map.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.map} ${styles.error}`}>
        <p className={feedback.stateMessageError}>
          {error.message || 'Could not load ship positions.'}
        </p>
      </div>
    );
  }

  const mapClassName =
    isRefreshing && hasFeatures
      ? `${styles.map} ${styles.refreshing}`
      : styles.map;

  return (
    <div className={mapClassName}>
      {isLoading && !hasFeatures ? (
        <div className={styles.loading}>
          <span className={feedback.spinner} aria-hidden />
          Loading fleet positions…
        </div>
      ) : null}
      <Map
        reuseMaps
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={(e) => emitBounds(e.target)}
        onMoveEnd={(e) => emitBounds(e.target)}
      >
        <Source
          id={SHIP_SOURCE_ID}
          type="geojson"
          data={featureCollection}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterCircleLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </div>
  );
});
