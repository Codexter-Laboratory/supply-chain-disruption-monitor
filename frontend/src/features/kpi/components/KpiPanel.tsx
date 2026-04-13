import { memo } from 'react';
import type { KpiPanelViewModel } from '../mappers/kpi.mapper';
import styles from './KpiPanel.module.css';

export interface KpiPanelProps {
  readonly view: KpiPanelViewModel | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

function KpiPanelInner({ view, isLoading, error }: KpiPanelProps) {
  return (
    <section
      className="dashboard-section panel panel--stacked"
      aria-label="Key performance indicators"
    >
      <div className="panel-head">
        <h2 className="section-title">KPIs</h2>
      </div>

      <div className={styles.kpiBody}>
        {error ? (
          <p className={styles.error} role="alert">
            {error.message}
          </p>
        ) : isLoading && !view ? (
          <p className={`muted ${styles.bodyText}`} aria-busy="true">
            Loading KPIs…
          </p>
        ) : !view ? (
          <p className={`muted ${styles.bodyText}`}>No KPI data</p>
        ) : (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Maritime</h3>
              <ul className={styles.list}>
                <li className={styles.row}>
                  <span className="muted">Total vessels</span>
                  <span>{view.maritime.totalVessels}</span>
                </li>
                <li className={styles.row}>
                  <span className="muted">Delayed vessels</span>
                  <span>{view.maritime.delayedVessels}</span>
                </li>
                <li className={styles.row}>
                  <span className="muted">Avg delay</span>
                  <span>{view.maritime.averageDelay}</span>
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Financial</h3>
              <ul className={styles.list}>
                <li className={styles.row}>
                  <span className="muted">Total cargo value</span>
                  <span>{view.financial.totalCargo}</span>
                </li>
                <li className={styles.row}>
                  <span className="muted">Oil value</span>
                  <span>{view.financial.oil}</span>
                </li>
                <li className={styles.row}>
                  <span className="muted">LNG value</span>
                  <span>{view.financial.lng}</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export const KpiPanel = memo(KpiPanelInner);
