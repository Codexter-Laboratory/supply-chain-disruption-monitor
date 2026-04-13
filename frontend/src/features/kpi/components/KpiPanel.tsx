import { memo, useMemo } from 'react';
import type { KpiSnapshot } from '../api/kpi.api';
import {
  formatCurrency,
  formatHours,
  formatNumber,
} from '../utils/format';
import styles from './KpiPanel.module.css';

export interface KpiPanelProps {
  readonly kpi: KpiSnapshot | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

function KpiPanelInner({ kpi, isLoading, error }: KpiPanelProps) {
  const labels = useMemo(() => {
    if (!kpi) {
      return null;
    }
    return {
      totalVessels: formatNumber(kpi.maritime.totalVessels),
      delayedVessels: formatNumber(kpi.maritime.delayedVessels),
      avgDelay: formatHours(kpi.maritime.averageDelayTimeHours),
      totalCargo: formatCurrency(kpi.financial.totalCargoValue),
      oil: formatCurrency(kpi.financial.estimatedOilValue),
      lng: formatCurrency(kpi.financial.estimatedLngValue),
    };
  }, [kpi]);

  if (error) {
    return (
      <div className={styles.root}>
        <p className={styles.error} role="alert">
          {error.message}
        </p>
      </div>
    );
  }

  if (isLoading && !kpi) {
    return (
      <div className={styles.root} aria-busy="true">
        <p className={styles.dim}>Loading KPIs…</p>
      </div>
    );
  }

  if (!labels) {
    return (
      <div className={styles.root}>
        <p className={styles.dim}>No KPI data</p>
      </div>
    );
  }

  return (
    <section className={styles.root} aria-label="Key performance indicators">
      <h2 className={styles.title}>KPIs</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>Maritime</h3>
        <ul className={styles.list}>
          <li className={styles.row}>
            <span className={styles.dim}>Total vessels</span>
            <span>{labels.totalVessels}</span>
          </li>
          <li className={styles.row}>
            <span className={styles.dim}>Delayed vessels</span>
            <span>{labels.delayedVessels}</span>
          </li>
          <li className={styles.row}>
            <span className={styles.dim}>Avg delay</span>
            <span>{labels.avgDelay}</span>
          </li>
        </ul>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>Financial</h3>
        <ul className={styles.list}>
          <li className={styles.row}>
            <span className={styles.dim}>Total cargo value</span>
            <span>{labels.totalCargo}</span>
          </li>
          <li className={styles.row}>
            <span className={styles.dim}>Oil value</span>
            <span>{labels.oil}</span>
          </li>
          <li className={styles.row}>
            <span className={styles.dim}>LNG value</span>
            <span>{labels.lng}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export const KpiPanel = memo(KpiPanelInner);
