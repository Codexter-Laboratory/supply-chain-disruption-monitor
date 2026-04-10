/**
 * Axis-aligned bounding box in WGS-84 degrees.
 * Intended for repository-level filtering (e.g. map viewport); does not handle antimeridian wraps.
 */
export type ShipGeoBoundingBox = {
  readonly minLatitude: number;
  readonly maxLatitude: number;
  readonly minLongitude: number;
  readonly maxLongitude: number;
};
