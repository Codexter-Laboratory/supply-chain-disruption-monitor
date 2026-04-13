import type { KpiSnapshot } from '../../../services/api/kpi.api';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const hoursFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatHours(value: number): string {
  return `${hoursFormatter.format(value)} h`;
}

/** UI-ready KPI strings for the panel (no raw numbers in components). */
export interface KpiPanelViewModel {
  readonly maritime: {
    readonly totalVessels: string;
    readonly delayedVessels: string;
    readonly averageDelay: string;
  };
  readonly financial: {
    readonly totalCargo: string;
    readonly oil: string;
    readonly lng: string;
  };
}

export function mapKpiSnapshotToPanelView(
  snapshot: KpiSnapshot,
): KpiPanelViewModel {
  return {
    maritime: {
      totalVessels: formatNumber(snapshot.maritime.totalVessels),
      delayedVessels: formatNumber(snapshot.maritime.delayedVessels),
      averageDelay: formatHours(snapshot.maritime.averageDelayTimeHours),
    },
    financial: {
      totalCargo: formatCurrency(snapshot.financial.totalCargoValue),
      oil: formatCurrency(snapshot.financial.estimatedOilValue),
      lng: formatCurrency(snapshot.financial.estimatedLngValue),
    },
  };
}
