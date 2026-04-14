import { memo } from 'react';
import { Panel } from '../../../components/panel/Panel';
import type { Alert } from '../../../types/api';
import feedback from '../../../styles/feedback.module.css';
import styles from './AlertsPanel.module.css';

export interface AlertsPanelProps {
  readonly alerts: Alert[];
}

function severityBadgeClass(severity: string): string {
  const u = severity.toUpperCase();
  if (u === 'CRITICAL') {
    return `${styles.badge} ${styles.badgeCritical}`;
  }
  if (u === 'WARNING') {
    return `${styles.badge} ${styles.badgeWarning}`;
  }
  return `${styles.badge} ${styles.badgeInfo}`;
}

function formatAlertTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AlertsPanelInner({ alerts }: AlertsPanelProps) {
  return (
    <Panel title="Alerts" className={styles.root} ariaLabel="Alerts">
      <div className={styles.scrollArea}>
        {alerts.length === 0 ? (
          <p className={feedback.stateMessageEmpty}>No active alerts</p>
        ) : (
          <ul className={styles.list} role="list">
            {alerts.map((a) => (
              <li key={a.id} className={styles.row}>
                <span
                  className={severityBadgeClass(a.severity)}
                  title={a.type}
                >
                  {a.severity}
                </span>
                <div className={styles.body}>
                  <p className={styles.message}>{a.message}</p>
                  <time className={styles.time} dateTime={a.createdAt}>
                    {formatAlertTime(a.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

export const AlertsPanel = memo(AlertsPanelInner);
