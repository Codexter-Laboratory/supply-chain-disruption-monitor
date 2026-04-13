/** Narrow port so upstream modules can schedule KPI refresh without coupling to the orchestrator. */
export const KPI_REFRESH_SCHEDULER = Symbol('KPI_REFRESH_SCHEDULER');

export interface KpiRefreshSchedulerPort {
  scheduleRecompute(): void;
}
