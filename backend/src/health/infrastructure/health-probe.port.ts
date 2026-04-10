/** Reserved for readiness probes (e.g. database); not wired yet. */
export const HEALTH_PROBE = Symbol('HEALTH_PROBE');

export interface HealthProbePort {
  isReady(): Promise<boolean>;
}
