import { CommodityType } from '@supply-chain/maritime-intelligence';
import type { KpiSnapshot } from '../../kpi/domain/kpi.types';
import { Alert, AlertSeverity, AlertType } from './alert.entity';

const HIGH_DELAYED_CARGO_VALUE_USD = 100_000_000;
const COMMODITY_STRESS_DELAYED_VALUE_USD = 50_000_000;
const MIN_DELAYED_VESSELS_WARNING = 5;

function sumDelayedCargoValueUsd(snapshot: KpiSnapshot): number {
  let s = 0;
  for (const v of Object.values(snapshot.delayedCargoValueByCommodity)) {
    s += v;
  }
  return s;
}

function nextAlertId(prefix: string): { id: string; createdAt: Date } {
  const createdAt = new Date(Date.now());
  return { id: `${prefix}:${createdAt.getTime()}`, createdAt };
}

/**
 * Fires when aggregate delayed cargo value (sum of {@link KpiSnapshot.delayedCargoValueByCommodity}) is very high.
 */
export function detectHighValueDelay(snapshot: KpiSnapshot): Alert | null {
  if (sumDelayedCargoValueUsd(snapshot) <= HIGH_DELAYED_CARGO_VALUE_USD) {
    return null;
  }
  const { id, createdAt } = nextAlertId('HIGH_VALUE_DELAY');
  return new Alert(
    id,
    AlertType.HIGH_VALUE_DELAY,
    AlertSeverity.CRITICAL,
    'High-value cargo delays exceed $100M',
    createdAt,
  );
}

/**
 * Fires when enough vessels are in a delayed state.
 */
export function detectSupplyDisruption(snapshot: KpiSnapshot): Alert | null {
  if (snapshot.maritime.delayedVessels < MIN_DELAYED_VESSELS_WARNING) {
    return null;
  }
  const { id, createdAt } = nextAlertId('SUPPLY_DISRUPTION');
  return new Alert(
    id,
    AlertType.SUPPLY_DISRUPTION,
    AlertSeverity.WARNING,
    'Multiple vessel delays detected',
    createdAt,
  );
}

function commodityWithMaxDelayedValue(
  snapshot: KpiSnapshot,
): { commodity: CommodityType; value: number } | null {
  let best: { commodity: CommodityType; value: number } | null = null;
  for (const commodity of Object.values(CommodityType) as CommodityType[]) {
    const value = snapshot.delayedCargoValueByCommodity[commodity];
    if (best === null || value > best.value) {
      best = { commodity, value };
    }
  }
  return best;
}

/**
 * Fires when one commodity’s delayed cargo value dominates above a stress threshold.
 */
export function detectCommodityStress(snapshot: KpiSnapshot): Alert | null {
  const top = commodityWithMaxDelayedValue(snapshot);
  if (top === null || top.value <= COMMODITY_STRESS_DELAYED_VALUE_USD) {
    return null;
  }
  const { id, createdAt } = nextAlertId('COMMODITY_STRESS');
  return new Alert(
    id,
    AlertType.COMMODITY_STRESS,
    AlertSeverity.WARNING,
    `${top.commodity} experiencing significant delays`,
    createdAt,
  );
}
