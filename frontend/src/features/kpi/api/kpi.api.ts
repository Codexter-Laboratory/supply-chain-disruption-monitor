/**
 * KPI feature API surface. Implementations and GraphQL documents live under `services/api`.
 */
export {
  fetchKpiSnapshot,
  subscribeToKpiUpdates,
  type KpiFinancialSlice,
  type KpiMaritimeSlice,
  type KpiSnapshot,
  type KpiSubscriptionHandlers,
} from '../../../services/api/kpi';
