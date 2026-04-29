import { Inject, Injectable } from '@nestjs/common';
import type { HttpClientPort } from '../../shared/http/http-client.port';
import { HTTP_CLIENT } from '../../shared/http/http.module';
import { SHIP_REPOSITORY } from '../../ships/application/ship.repository.port';
import type { ShipRepositoryPort } from '../../ships/application/ship.repository.port';
import { VesselTrackingStatusStore } from '../application/vessel-tracking-status.store';
import type { NormalizedVesselPosition } from '../domain/normalized-vessel-position';
import type { VesselTrackingProviderPort } from '../application/vessel-tracking-provider.port';
import {
  appendKnownImosQuery,
  getAisTrackingConfig,
} from '../config/ais-tracking.config';

/** Conservative envelope for generic AIS-style JSON (vendor-neutral). */
type AisApiResponse = {
  vessels?: unknown[];
  data?: unknown[];
};

@Injectable()
export class RealAisVesselTrackingProvider implements VesselTrackingProviderPort {
  constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClientPort,
    @Inject(SHIP_REPOSITORY) private readonly ships: ShipRepositoryPort,
    private readonly status: VesselTrackingStatusStore,
  ) {}

  async fetchLatestPositions(): Promise<readonly NormalizedVesselPosition[]> {
    const now = new Date();
    this.status.patchProvider({
      lastAttemptAt: now,
      providerName: 'real-ais',
    });

    const config = getAisTrackingConfig();
    if (config === null) {
      this.status.patchProvider({
        configured: false,
        providerName: 'real-ais',
        lastFailureAt: null,
        lastErrorMessage: null,
        lastSuccessAt: null,
        knownImosRequested: 0,
        recordsReceived: 0,
        recordsNormalized: 0,
        recordsReturned: 0,
        recordsSkipped: 0,
      });
      return [];
    }

    this.status.patchProvider({
      configured: true,
      providerName: config.providerName,
    });

    let rawImos: readonly string[];
    try {
      rawImos = await this.ships.findKnownImos();
    } catch {
      this.status.patchProvider({
        lastFailureAt: now,
        lastErrorMessage: 'known_imos_lookup_failed',
        knownImosRequested: 0,
        recordsReceived: 0,
        recordsNormalized: 0,
        recordsReturned: 0,
        recordsSkipped: 0,
      });
      return [];
    }

    const imos = dedupeTrimmedImos(rawImos);
    if (imos.length === 0) {
      this.status.patchProvider({
        lastSuccessAt: now,
        lastFailureAt: null,
        lastErrorMessage: null,
        knownImosRequested: 0,
        recordsReceived: 0,
        recordsNormalized: 0,
        recordsReturned: 0,
        recordsSkipped: 0,
      });
      return [];
    }

    const knownImoSet = new Set(imos);

    const url = appendKnownImosQuery(config.baseUrl, imos);

    let body: unknown;
    try {
      body = await this.http.get<AisApiResponse>(url, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
    } catch (e) {
      const msg = sanitizeErrorMessage(e);
      this.status.patchProvider({
        lastFailureAt: now,
        lastErrorMessage: msg,
        knownImosRequested: imos.length,
        recordsReceived: 0,
        recordsNormalized: 0,
        recordsReturned: 0,
        recordsSkipped: 0,
      });
      return [];
    }

    const rows = extractRecordArray(body);
    const received = rows.length;
    const normalized = normalizeAisRows(rows, config.providerName);
    const normCount = normalized.length;
    const filtered = normalized.filter((p) => knownImoSet.has(p.imo.trim()));
    const returned = filtered.length;
    const skipped = Math.max(0, received - returned);

    this.status.patchProvider({
      lastSuccessAt: now,
      lastFailureAt: null,
      lastErrorMessage: null,
      knownImosRequested: imos.length,
      recordsReceived: received,
      recordsNormalized: normCount,
      recordsReturned: returned,
      recordsSkipped: skipped,
    });

    return filtered;
  }
}

function sanitizeErrorMessage(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const t = raw.trim();
  if (t.length === 0) {
    return 'http_error';
  }
  return t.length > 240 ? `${t.slice(0, 240)}…` : t;
}

function dedupeTrimmedImos(imos: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of imos) {
    const t = raw.trim();
    if (t.length === 0 || seen.has(t)) {
      continue;
    }
    seen.add(t);
    out.push(t);
  }
  return out;
}

function normalizeAisRows(
  rows: readonly unknown[],
  source: string,
): NormalizedVesselPosition[] {
  const out: NormalizedVesselPosition[] = [];
  for (const row of rows) {
    const pos = tryNormalizeRecord(row, source);
    if (pos !== null) {
      out.push(pos);
    }
  }
  return out;
}

function extractRecordArray(body: unknown): unknown[] {
  if (Array.isArray(body)) {
    return body;
  }
  if (body !== null && typeof body === 'object') {
    const o = body as AisApiResponse;
    if (Array.isArray(o.vessels)) {
      return o.vessels;
    }
    if (Array.isArray(o.data)) {
      return o.data;
    }
  }
  return [];
}

function tryNormalizeRecord(
  row: unknown,
  source: string,
): NormalizedVesselPosition | null {
  if (row === null || typeof row !== 'object') {
    return null;
  }
  const r = row as Record<string, unknown>;

  const imo = pickFirstString(r, ['imo', 'IMO']);
  if (imo === undefined || imo.length === 0) {
    return null;
  }

  const lat = pickFirstNumber(r, ['lat', 'latitude', 'LAT']);
  const lon = pickFirstNumber(r, ['lon', 'lng', 'longitude', 'LON']);
  if (
    lat === undefined ||
    lon === undefined ||
    !isValidLatitude(lat) ||
    !isValidLongitude(lon)
  ) {
    return null;
  }

  const observedAt = pickObservedAt(r);
  const name = pickFirstString(r, ['name', 'vesselName', 'shipName']);
  const speedKnots = pickOptionalFiniteNumber(r, [
    'speed',
    'speedKnots',
    'sog',
  ]);
  const headingDegrees = pickOptionalFiniteNumber(r, [
    'heading',
    'course',
    'cog',
  ]);
  const destination = pickFirstString(r, ['destination', 'dest']);
  const eta = pickOptionalDate(r, ['eta', 'ETA']);

  const base: NormalizedVesselPosition = {
    imo,
    latitude: lat,
    longitude: lon,
    observedAt,
    source,
    ...(name !== undefined ? { name } : {}),
    ...(speedKnots !== undefined ? { speedKnots } : {}),
    ...(headingDegrees !== undefined ? { headingDegrees } : {}),
    ...(destination !== undefined ? { destination } : {}),
    ...(eta !== undefined ? { eta } : {}),
  };
  return base;
}

function pickFirstString(
  obj: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v === undefined || v === null) {
      continue;
    }
    if (typeof v === 'string') {
      const t = v.trim();
      if (t.length > 0) {
        return t;
      }
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      return String(v);
    }
  }
  return undefined;
}

function pickFirstNumber(
  obj: Record<string, unknown>,
  keys: readonly string[],
): number | undefined {
  for (const k of keys) {
    const n = coerceNumber(obj[k]);
    if (n !== undefined) {
      return n;
    }
  }
  return undefined;
}

function pickOptionalFiniteNumber(
  obj: Record<string, unknown>,
  keys: readonly string[],
): number | undefined {
  const n = pickFirstNumber(obj, keys);
  if (n === undefined || !Number.isFinite(n)) {
    return undefined;
  }
  return n;
}

function coerceNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  if (typeof v === 'string') {
    const t = v.trim();
    if (t.length === 0) {
      return undefined;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function pickObservedAt(r: Record<string, unknown>): Date {
  const keys = ['timestamp', 'observedAt', 'lastSeen'] as const;
  for (const k of keys) {
    const d = coerceDate(r[k]);
    if (d !== undefined) {
      return d;
    }
  }
  return new Date();
}

function pickOptionalDate(
  r: Record<string, unknown>,
  keys: readonly string[],
): Date | undefined {
  for (const k of keys) {
    const d = coerceDate(r[k]);
    if (d !== undefined) {
      return d;
    }
  }
  return undefined;
}

function coerceDate(v: unknown): Date | undefined {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isFinite(t) ? v : undefined;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : undefined;
  }
  if (typeof v === 'string') {
    const t = v.trim();
    if (t.length === 0) {
      return undefined;
    }
    const d = new Date(t);
    return Number.isFinite(d.getTime()) ? d : undefined;
  }
  return undefined;
}

function isValidLatitude(lat: number): boolean {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lon: number): boolean {
  return Number.isFinite(lon) && lon >= -180 && lon <= 180;
}
