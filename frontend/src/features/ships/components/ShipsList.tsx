import type { Ship, ShipOperationalStatus } from '../../../types/api';
import feedback from '../../../styles/feedback.module.css';
import styles from './ShipsList.module.css';

const PILL_BY_STATUS = {
  MOVING: styles.pillMoving,
  WAITING: styles.pillWaiting,
  BLOCKED: styles.pillBlocked,
  DELAYED: styles.pillDelayed,
} as Record<ShipOperationalStatus, string>;

export interface ShipsListProps {
  ships: Ship[];
  rangeLabel: string;
  canPrev: boolean;
  canNext: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
  flashShipId?: string | null;
  error?: Error | null;
}

export function ShipsList({
  ships,
  rangeLabel,
  canPrev,
  canNext,
  isLoading,
  isFetching,
  onPrev,
  onNext,
  flashShipId,
  error,
}: ShipsListProps) {
  return (
    <section className="dashboard-section panel panel--main">
      <div className="panel-head">
        <h2 className="section-title">Ships</h2>
        {!isLoading ? (
          <span className="muted">{rangeLabel}</span>
        ) : null}
        {isFetching && !isLoading ? (
          <span className="badge">Refreshing…</span>
        ) : null}
      </div>

      {error ? (
        <p className={feedback.stateMessageError} role="alert">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className={feedback.stateMessageLoading}>
          <span className={feedback.spinner} aria-hidden />
          <span>Loading ships…</span>
        </div>
      ) : (
        <>
          <div className={styles.pager}>
            <button type="button" disabled={!canPrev} onClick={onPrev}>
              Previous
            </button>
            <button type="button" disabled={!canNext} onClick={onNext}>
              Next
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>IMO</th>
                  <th>Country</th>
                  <th>Cargo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ships.map((s) => (
                  <tr
                    key={s.id}
                    className={
                      flashShipId === s.id ? styles.rowFlash : undefined
                    }
                  >
                    <td>{s.name}</td>
                    <td className="mono">{s.imo}</td>
                    <td>{s.country}</td>
                    <td>{s.cargoType}</td>
                    <td>
                      <span
                        className={`${styles.pill} ${PILL_BY_STATUS[s.currentStatus]}`}
                      >
                        {s.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ships.length === 0 && !error ? (
            <p className={feedback.stateMessageEmpty}>
              No data available for this page.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
