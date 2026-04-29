export type AisTrackingConfig = {
  readonly baseUrl: string;
  readonly apiKey: string;
  /** Label stored on `NormalizedVesselPosition.source` (not a vendor lock-in). */
  readonly providerName: string;
};

/** Appends `imos=<comma-separated, URL-encoded>` to the configured base URL (supports existing `?` in base). */
export function appendKnownImosQuery(
  baseUrl: string,
  imos: readonly string[],
): string {
  const base = baseUrl.trim().replace(/\/+$/, '');
  const list = imos.map((i) => i.trim()).filter((i) => i.length > 0);
  const encoded = encodeURIComponent(list.join(','));
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}imos=${encoded}`;
}

/**
 * Returns `null` when AIS HTTP is not configured (missing URL or key). Never throws.
 * Values are trimmed; secrets must not be logged by callers.
 */
export function getAisTrackingConfig(): AisTrackingConfig | null {
  const baseUrl = process.env.AIS_API_BASE_URL?.trim() ?? '';
  const apiKey = process.env.AIS_API_KEY?.trim() ?? '';
  if (baseUrl.length === 0 || apiKey.length === 0) {
    return null;
  }
  const name = process.env.AIS_PROVIDER_NAME?.trim();
  return {
    baseUrl,
    apiKey,
    providerName: name !== undefined && name.length > 0 ? name : 'ais',
  };
}
