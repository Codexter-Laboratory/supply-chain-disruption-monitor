import type { SupplyChainEventCreatedPayload } from '../../../types/api';

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
        <span className="live-indicator" title="Subscribed via GraphQL">
          LIVE
        </span>
      </div>
      {events.length === 0 ? (
        <p className="state-message state-message--empty">
          No events yet. Enable simulation to see supply-chain activity.
        </p>
      ) : (
        <ul className="event-list">
          {events.map((e) => (
            <li key={e.id}>
              <time className="event-time" dateTime={e.occurredAt}>
                {formatTimestamp(e.occurredAt)}
              </time>
              <span className="event-type">{e.type}</span>
              <span className="muted event-ship">
                Ship <span className="mono">{e.shipId.slice(0, 10)}…</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
