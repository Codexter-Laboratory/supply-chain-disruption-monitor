import { memo, useMemo, type CSSProperties } from 'react';

export type ShipMarkerProps = {
  position: { latitude: number; longitude: number };
  status: string;
  /** Shown as native tooltip (e.g. ship id or name). */
  title: string;
};

function markerFill(status: string): string {
  switch (status) {
    case 'MOVING':
      return '#188038';
    case 'DELAYED':
      return '#c5221f';
    case 'WAITING':
    case 'BLOCKED':
      return '#e3a008';
    default:
      return '#6b7280';
  }
}

export const ShipMarker = memo(function ShipMarker({
  position,
  status,
  title,
}: ShipMarkerProps) {
  const fill = useMemo(() => markerFill(status), [status]);

  return (
    <div
      className="ship-marker"
      title={title}
      data-lat={position.latitude}
      data-lng={position.longitude}
      style={
        {
          '--ship-marker-fill': fill,
        } as CSSProperties
      }
    >
      <span className="ship-marker__dot" aria-hidden />
    </div>
  );
});
