import type { KpiSnapshot } from '../../kpi/domain/kpi.types';
import type { Alert } from './alert.entity';
import {
  detectCommodityStress,
  detectHighValueDelay,
  detectSupplyDisruption,
} from './alert-rules';

export function detectAlerts(snapshot: KpiSnapshot): Alert[] {
  return [
    detectHighValueDelay(snapshot),
    detectSupplyDisruption(snapshot),
    detectCommodityStress(snapshot),
  ].filter((a): a is Alert => a !== null);
}
