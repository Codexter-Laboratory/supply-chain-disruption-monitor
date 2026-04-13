import type { CommodityType } from '../../types/api';

/**
 * All commodities supported by the energy price API (aligned with backend
 * {@link CommodityType}). Listed explicitly so the UI bundle does not depend on
 * CJS enum runtime exports from the shared maritime package.
 */
export const COMMODITY_OPTIONS = [
  'OIL',
  'LNG',
  'LPG',
  'REFINED_PRODUCTS',
  'PETROCHEMICALS',
  'CONTAINER',
  'BULK',
] as readonly CommodityType[];

/** Initial series shown until the user selects another commodity. */
export const DEFAULT_ENERGY_TREND_COMMODITY: CommodityType =
  COMMODITY_OPTIONS[0]!;

export function parseCommodityType(value: string): CommodityType | null {
  return (COMMODITY_OPTIONS as readonly string[]).includes(value)
    ? (value as CommodityType)
    : null;
}
