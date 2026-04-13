import { memo } from 'react';
import type { LiveEventRow } from '../mappers/supply-chain-event.mapper';
import feedback from '../../../styles/feedback.module.css';
import styles from './LiveSupplyChainPanel.module.css';

export interface LiveSupplyChainPanelProps {
  readonly rows: readonly LiveEventRow[];
}

const SHIP_LABEL_MAX = 22;

function compactShipLabel(raw: string): string {
  const t = raw.trim();
  if (t.length <= SHIP_LABEL_MAX) {
    return t;
  }
  return `${t.slice(0, SHIP_LABEL_MAX - 1)}…`;
}

function LiveSupplyChainPanelInner({ rows }: LiveSupplyChainPanelProps) {
  return (
    <section className="dashboard-section panel panel--stacked panel--fixedScrollLayout">
      <div className="panel-head panel-head--live">
        <h2 className="section-title">Live Events</h2>
        <span
          className={styles.liveIndicator}
          title="Subscribed via GraphQL"
        >
          LIVE
        </span>
      </div>

      <div className="panel-body">
        {rows.length === 0 ? (
          <p className={feedback.stateMessageEmpty}>
            Waiting for events…
          </p>
        ) : (
          <ul className={styles.eventList}>
            {rows.map((row) => (
              <li key={row.id}>
                <span className={styles.eventTime}>{row.timeLabel}</span>
                <span className={styles.sep} aria-hidden>
                  •
                </span>
                <span className={styles.eventType}>{row.typeLabel}</span>
                <span className={styles.sep} aria-hidden>
                  •
                </span>
                <span className={styles.eventShip} title={row.shipLabel}>
                  {compactShipLabel(row.shipLabel)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export const LiveSupplyChainPanel = memo(LiveSupplyChainPanelInner);
