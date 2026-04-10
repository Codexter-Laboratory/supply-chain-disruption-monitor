/**
 * Stable Mapbox layer specs (map-native rendering, no React per-ship components).
 * Colors align with prior marker semantics.
 */
import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from 'mapbox-gl';

export const SHIP_SOURCE_ID = 'ships-geojson';

export const clusterCircleLayer: Omit<CircleLayerSpecification, 'source'> = {
  id: 'ship-clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': 'rgba(76, 159, 254, 0.92)',
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(255, 255, 255, 0.9)',
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      14,
      10,
      20,
      50,
      26,
      200,
      34,
      500,
      42,
    ],
  },
};

export const clusterCountLayer: Omit<SymbolLayerSpecification, 'source'> = {
  id: 'ship-cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-size': 12,
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
  },
  paint: {
    'text-color': '#ffffff',
  },
};

export const unclusteredPointLayer: Omit<CircleLayerSpecification, 'source'> = {
  id: 'ship-unclustered',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-radius': 7,
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(255, 255, 255, 0.92)',
    'circle-color': [
      'match',
      ['get', 'status'],
      'MOVING',
      '#188038',
      'DELAYED',
      '#c5221f',
      'WAITING',
      '#e3a008',
      'BLOCKED',
      '#e3a008',
      '#6b7280',
    ],
  },
};
