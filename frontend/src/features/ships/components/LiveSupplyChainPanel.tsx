import type { SupplyChainEventCreatedPayload } from '../../../types/api';
import feedback from '../../../styles/feedback.module.css';
import styles from './LiveSupplyChainPanel.module.css';

export interface LiveSupplyChainPanelProps {
  events: SupplyChainEventCreatedPayload[];
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

export function LiveSupplyChainPanel({ events }: LiveSupplyChainPanelProps) {
  return (
    <section className="dashboard-section panel panel--stacked">
      <div className="panel-head panel-head--live">
        <h2 className="section-title">Live Events</h2>
        <span
          className={styles.liveIndicator}
          title="Subscribed via GraphQL"
        >
          LIVE
        </span>
      </div>
      {events.length === 0 ? (
        <p className={feedback.stateMessageEmpty}>
          No events yet. Enable simulation to see supply-chain activity.
        </p>
      ) : (
        <ul className={styles.eventList}>
          {events.map((e) => (
            <li key={e.id}>
              <time className={styles.eventTime} dateTime={e.occurredAt}>
                {formatTimestamp(e.occurredAt)}
              </time>
              <span className={styles.eventType}>{e.type}</span>
              <span className={`muted ${styles.eventShip}`}>
                Ship <span className="mono">{e.shipId.slice(0, 10)}…</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
