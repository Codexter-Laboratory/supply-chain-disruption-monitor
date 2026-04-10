import type { Ship } from '../../../types/api';

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
        <p className="state-message state-message--error" role="alert">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="state-message state-message--loading">
          <span className="spinner" aria-hidden />
          <span>Loading ships…</span>
        </div>
      ) : (
        <>
          <div className="pager">
            <button type="button" disabled={!canPrev} onClick={onPrev}>
              Previous
            </button>
            <button type="button" disabled={!canNext} onClick={onNext}>
              Next
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
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
                      flashShipId === s.id ? 'table-row--flash' : undefined
                    }
                  >
                    <td>{s.name}</td>
                    <td className="mono">{s.imo}</td>
                    <td>{s.country}</td>
                    <td>{s.cargoType}</td>
                    <td>
                      <span
                        className={`pill pill-${s.currentStatus.toLowerCase()}`}
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
            <p className="state-message state-message--empty">
              No data available for this page.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
