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
  /** Ships to visually emphasize (e.g. after live position/status change). */
  highlightedShipIds?: ReadonlySet<string>;
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
  highlightedShipIds,
  error,
}: ShipsListProps) {
  const initialLoad = isLoading && ships.length === 0;
  const bodyBusy = isFetching && ships.length > 0;

  return (
    <section className="dashboard-section panel panel--main">
      <div className="panel-head">
        <h2 className="section-title">Ships</h2>
        {!initialLoad && rangeLabel ? (
          <span className="muted">{rangeLabel}</span>
        ) : null}
        {isFetching && !initialLoad ? (
          <span className="badge">Updating…</span>
        ) : null}
      </div>

      {error ? (
        <p className={feedback.stateMessageError} role="alert">
          {error.message}
        </p>
      ) : null}

      <div className={styles.pager}>
        <button
          type="button"
          disabled={!canPrev || initialLoad || isFetching}
          onClick={onPrev}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext || initialLoad || isFetching}
          onClick={onNext}
        >
          Next
        </button>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableInner}>
          {bodyBusy ? (
            <div
              className={styles.tableBodyLoader}
              role="status"
              aria-live="polite"
              aria-label="Loading page"
            >
              <span className={feedback.spinner} aria-hidden />
            </div>
          ) : null}
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
            <tbody
              className={
                initialLoad || bodyBusy ? styles.tbodyMuted : undefined
              }
            >
              {initialLoad ? (
                <tr>
                  <td className={styles.tbodyLoadingCell} colSpan={5}>
                    <div className={styles.tbodyLoadingInner}>
                      <span className={feedback.spinner} aria-hidden />
                      <span>Loading ships…</span>
                    </div>
                  </td>
                </tr>
              ) : (
                ships.map((s) => (
                  <tr
                    key={s.id}
                    className={
                      highlightedShipIds?.has(s.id)
                        ? styles.rowFlash
                        : undefined
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!initialLoad && ships.length === 0 && !error ? (
        <p className={feedback.stateMessageEmpty}>
          No data available for this page.
        </p>
      ) : null}
    </section>
  );
}
