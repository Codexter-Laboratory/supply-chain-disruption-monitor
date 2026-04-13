import type { SupplyChainEventCreatedPayload } from '../../../types/api';

export interface LiveEventRow {
  readonly id: string;
  readonly timeLabel: string;
  readonly typeLabel: string;
  readonly shipLabel: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
}

export function mapSupplyChainEventToRow(
  e: SupplyChainEventCreatedPayload,
): LiveEventRow {
  const ship =
    e.region != null && e.region !== ''
      ? `${e.shipId} · ${e.region}`
      : e.shipId;
  return {
    id: e.id,
    timeLabel: formatTime(e.occurredAt),
    typeLabel: e.type,
    shipLabel: ship,
  };
}
