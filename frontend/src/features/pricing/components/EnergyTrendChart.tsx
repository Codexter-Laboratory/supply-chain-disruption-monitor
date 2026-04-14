import { useMemo, useState } from 'react';
import type {
  CommodityType,
  EnergyPrice,
  EnergyPriceTrendDirection,
} from '../../../types/api';
import feedback from '../../../styles/feedback.module.css';
import styles from './EnergyTrendChart.module.css';

type Timeframe = '24H' | '7D' | '30D';

export interface EnergyTrendChartProps {
  kind: CommodityType;
  points: EnergyPrice[];
  simpleTrend: EnergyPriceTrendDirection;
  isLoading: boolean;
  error?: Error | null;
}

function smooth(values: number[], window: number): number[] {
  if (values.length === 0) {
    return [];
  }
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
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

const TIMEFRAMES: readonly Timeframe[] = ['24H', '7D', '30D'];

export function EnergyTrendChart({
  kind,
  points,
  simpleTrend,
  isLoading,
  error,
}: EnergyTrendChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');

  const baseNums = useMemo(
    () => points.map((p) => Number(p.value)).filter((n) => Number.isFinite(n)),
    [points],
  );

  const displayNums = useMemo(() => {
    switch (timeframe) {
      case '7D':
        return smooth(baseNums, 3);
      case '30D':
        return smooth(baseNums, 6).filter((_, i) => i % 2 === 0);
      default:
        return baseNums.slice();
    }
  }, [baseNums, timeframe]);

  const w = 280;
  const h = 168;
  const d = sparklinePath(displayNums, w, h);

  const firstNum = displayNums[0];
  const lastNum = displayNums[displayNums.length - 1];
  const displayPrice =
    lastNum !== undefined && Number.isFinite(lastNum)
      ? lastNum.toFixed(2)
      : '--';
  const changePct =
    firstNum !== undefined &&
    lastNum !== undefined &&
    Number.isFinite(firstNum) &&
    Number.isFinite(lastNum) &&
    firstNum !== 0
      ? ((lastNum - firstNum) / firstNum) * 100
      : null;

  const hasRawSeries = baseNums.length > 0;
  const showPriceBlock = hasRawSeries && displayPrice !== '--';
  const showChart = displayNums.length >= 2;

  return (
    <div className={styles.chartBody}>
      {error ? (
        <p className={feedback.stateMessageError} role="alert">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className={feedback.stateMessageLoading}>
          <span className={feedback.spinner} aria-hidden />
          <span>Loading price trend…</span>
        </div>
      ) : (
        <>
          <div
            className={styles.timeframeRow}
            role="group"
            aria-label="Chart timeframe"
          >
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                className={
                  timeframe === tf
                    ? styles.timeframeButtonActive
                    : styles.timeframeButton
                }
                aria-pressed={timeframe === tf}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          {showPriceBlock ? (
            <div className={styles.priceBlock}>
              <div className={`${styles.priceValue} mono`}>{displayPrice}</div>
              {changePct !== null ? (
                <div
                  className={
                    changePct >= 0
                      ? styles.priceChangePositive
                      : styles.priceChangeNegative
                  }
                >
                  {changePct >= 0 ? '▲' : '▼'} {changePct.toFixed(2)}%
                </div>
              ) : null}
            </div>
          ) : null}

          {baseNums.length < 2 && !error ? (
            <p className={feedback.stateMessageEmpty}>
              No data available yet. Run simulation / pricing ingestion to
              build history.
            </p>
          ) : null}

          {showChart ? (
            <div className={styles.chartContainer}>
              <svg
                className={styles.sparkline}
                viewBox={`0 0 ${w} ${h}`}
                width="100%"
                height={h}
                role="img"
                aria-label={`${kind} price trend, ${timeframe} (${simpleTrend})`}
              >
                <path
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
