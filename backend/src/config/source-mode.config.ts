/** How a bounded context is expected to resolve data (`hybrid` is reserved for future live-first fallback). */
export type SourceMode = 'simulation' | 'real' | 'hybrid';

/**
 * Parses a single env value: trim, lowercase, accepts only simulation | real | hybrid.
 * Invalid or blank values return `fallback`.
 */
export function parseSourceMode(
  raw: string | undefined,
  fallback: SourceMode,
): SourceMode {
  if (raw === undefined || raw === null) {
    return fallback;
  }
  const s = String(raw).trim().toLowerCase();
  if (s === 'simulation' || s === 'real' || s === 'hybrid') {
    return s as SourceMode;
  }
  return fallback;
}

export function getNewsMode(): SourceMode {
  return parseSourceMode(process.env.NEWS_MODE, 'simulation');
}

export function getVesselTrackingMode(): SourceMode {
  return parseSourceMode(process.env.VESSEL_TRACKING_MODE, 'simulation');
}

export function getRoutesMode(): SourceMode {
  return parseSourceMode(process.env.ROUTES_MODE, 'simulation');
}

export function getEventsMode(): SourceMode {
  return parseSourceMode(process.env.EVENTS_MODE, 'simulation');
}
