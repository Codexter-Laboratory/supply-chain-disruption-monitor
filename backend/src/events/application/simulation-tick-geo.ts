import { Coordinates } from '../../common/domain/coordinates';

/** Rough destination hubs for simulation drift (not navigation-grade). */
const COUNTRY_TO_COORDS: Readonly<Record<string, { lat: number; lng: number }>> = {
  china: { lat: 31.2, lng: 121.5 },
  india: { lat: 19.1, lng: 72.9 },
  japan: { lat: 35.7, lng: 139.7 },
  'south korea': { lat: 35.1, lng: 129.0 },
  singapore: { lat: 1.29, lng: 103.85 },
  'united arab emirates': { lat: 24.5, lng: 54.4 },
  oman: { lat: 23.6, lng: 58.4 },
  qatar: { lat: 25.3, lng: 51.2 },
  kuwait: { lat: 29.4, lng: 47.9 },
  iran: { lat: 27.2, lng: 56.3 },
  iraq: { lat: 33.3, lng: 44.4 },
  egypt: { lat: 31.2, lng: 32.3 },
  greece: { lat: 37.98, lng: 23.73 },
  italy: { lat: 41.9, lng: 12.5 },
  spain: { lat: 40.4, lng: -3.7 },
  france: { lat: 43.3, lng: 5.4 },
  turkey: { lat: 41.0, lng: 29.0 },
  'saudi arabia': { lat: 24.7, lng: 46.7 },
  'united kingdom': { lat: 51.5, lng: -0.1 },
  germany: { lat: 53.5, lng: 9.9 },
  netherlands: { lat: 52.4, lng: 4.9 },
  norway: { lat: 60.4, lng: 5.3 },
  denmark: { lat: 56.2, lng: 10.2 },
  brazil: { lat: -22.9, lng: -43.2 },
  'united states': { lat: 40.7, lng: -74.0 },
  canada: { lat: 43.7, lng: -79.4 },
  australia: { lat: -33.9, lng: 151.2 },
  indonesia: { lat: -6.2, lng: 106.8 },
  malaysia: { lat: 3.14, lng: 101.7 },
};

const DEFAULT_HUB = { lat: 12.0, lng: 68.0 };

export function tradeDestinationCoordinates(destinationCountry: string): Coordinates {
  const key = destinationCountry.trim().toLowerCase();
  const hub = COUNTRY_TO_COORDS[key] ?? DEFAULT_HUB;
  return Coordinates.restore(hub.lat, hub.lng);
}

/** Viewport-style regions for dashboard grouping (coarse boxes). */
export function regionLabelForCoordinates(position: Coordinates): string | null {
  const { latitude: lat, longitude: lng } = position;
  if (lat >= 25 && lat <= 28 && lng >= 55 && lng <= 58.5) {
    return 'Strait of Hormuz';
  }
  if (lat >= 30 && lat <= 46 && lng >= -6 && lng <= 38) {
    return 'Mediterranean';
  }
  if (lat >= -20 && lat <= 25 && lng >= 40 && lng <= 120) {
    return 'Indian Ocean';
  }
  return null;
}
