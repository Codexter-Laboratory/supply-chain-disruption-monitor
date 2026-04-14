import { memo } from 'react';
import { Panel } from '../../../components/panel/Panel';
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
    <Panel
      title="Live Events"
      headerRight={
        <span className={styles.liveBadge} title="Subscribed via GraphQL">
          LIVE
        </span>
      }
    >
      <div className={styles.scrollArea}>
        {rows.length === 0 ? (
          <p className={feedback.stateMessageEmpty}>Waiting for events…</p>
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
    </Panel>
  );
}

export const LiveSupplyChainPanel = memo(LiveSupplyChainPanelInner);
