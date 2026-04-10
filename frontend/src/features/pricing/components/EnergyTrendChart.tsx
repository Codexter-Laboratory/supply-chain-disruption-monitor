import type { EnergyPrice, EnergyPriceTrendDirection } from '../../../types/api';

export interface EnergyTrendChartProps {
  kind: string;
  points: EnergyPrice[];
  simpleTrend: EnergyPriceTrendDirection;
  isLoading: boolean;
  error?: Error | null;
}

function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 4;
  const span = max - min || 1;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (v - min) / span) * (height - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function percentChange(first: number, last: number): string | null {
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) {
    return null;
  }
  const pct = ((last - first) / first) * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function EnergyTrendChart({
  kind,
  points,
  simpleTrend,
  isLoading,
  error,
}: EnergyTrendChartProps) {
  const nums = points.map((p) => Number(p.value)).filter((n) => Number.isFinite(n));
  const w = 280;
  const h = 100;
  const d = sparklinePath(nums, w, h);
  const lastPoint = points.length > 0 ? points[points.length - 1] : undefined;
  const currentValue = lastPoint?.value;
  const firstNum = nums[0];
  const lastNum = nums[nums.length - 1];
  const pct =
    nums.length >= 2 && firstNum !== undefined && lastNum !== undefined
      ? percentChange(firstNum, lastNum)
      : null;

  return (
    <section className="dashboard-section panel panel--stacked">
      <div className="panel-head">
        <h2 className="section-title">Energy Prices</h2>
        <span className="muted">{kind}</span>
      </div>

      {error ? (
        <p className="state-message state-message--error" role="alert">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="state-message state-message--loading">
          <span className="spinner" aria-hidden />
          <span>Loading price trend…</span>
        </div>
      ) : (
        <>
          {currentValue !== undefined ? (
            <div className="price-current">
              <span className="price-current-label">Current</span>
              <span className="price-current-value mono">{currentValue}</span>
              <span
                className={`trend trend-${simpleTrend.toLowerCase()} trend--inline`}
              >
                {simpleTrend}
              </span>
              {pct !== null ? (
                <span className="price-pct muted">({pct} vs window start)</span>
              ) : null}
            </div>
          ) : null}

          {nums.length < 2 && !error ? (
            <p className="state-message state-message--empty">
              No data available yet. Run simulation / pricing ingestion to build
              history.
            </p>
          ) : null}

          {nums.length >= 2 ? (
            <svg
              className="sparkline"
              viewBox={`0 0 ${w} ${h}`}
              width="100%"
              height={h}
              role="img"
              aria-label={`${kind} price trend`}
            >
              <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : null}

          {nums.length >= 2 ? (
            <ul className="price-foot">
              {points.slice(-3).map((p) => (
                <li key={p.id}>
                  <span className="mono">{p.value}</span>
                  <span className="muted">
                    {new Date(p.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
