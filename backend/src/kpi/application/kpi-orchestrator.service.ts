import { EventEmitter } from 'node:events';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../../realtime/application/pub-sub.token';
import { KPI_UPDATED_TOPIC } from '../../realtime/application/realtime-topics';
import { ShipApplicationService } from '../../ships/application/ship.application.service';
import type {
  FinancialKpis,
  KpiSnapshot,
  MaritimeKpis,
} from '../domain/kpi.types';
import { KpiService } from './kpi.service';
import { KPI_REFRESH_SCHEDULER, type KpiRefreshSchedulerPort } from './kpi-refresh.port';
import { shipToClassificationSource } from './ship-classification.adapter';

/** Debounce window for batching ship mutations before one KPI recompute. */
const KPI_RECOMPUTE_DEBOUNCE_MS = 400;

export const KPI_UPDATED_INTERNAL = 'kpi.updated';

@Injectable()
export class KpiOrchestratorService
  implements KpiRefreshSchedulerPort, OnModuleDestroy
{
  private readonly log = new Logger(KpiOrchestratorService.name);

  /** Latest computed snapshot (null until first successful recompute). */
  currentSnapshot: KpiSnapshot | null = null;

  /** True while a debounced recompute is waiting on the timer. */
  recomputeScheduled = false;

  debounceTimer: NodeJS.Timeout | null = null;

  /** Prevents overlapping async recomputes; coalesces trailing updates. */
  private recomputing = false;
  private needsAnotherAfterRun = false;

  /** In-process listeners (tests, workers); GraphQL uses PubSub separately. */
  private readonly internalEvents = new EventEmitter();

  constructor(
    private readonly ships: ShipApplicationService,
    private readonly kpi: KpiService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  onModuleDestroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.recomputeScheduled = false;
    this.internalEvents.removeAllListeners();
  }

  /**
   * Subscribe to internal `kpi.updated` (Node EventEmitter). Unsubscribe returns a disposer.
   */
  subscribeInternal(
    listener: (snapshot: KpiSnapshot) => void,
  ): () => void {
    this.internalEvents.on(KPI_UPDATED_INTERNAL, listener);
    return () => {
      this.internalEvents.off(KPI_UPDATED_INTERNAL, listener);
    };
  }

  scheduleRecompute(): void {
    if (this.recomputing) {
      this.needsAnotherAfterRun = true;
      return;
    }
    if (this.recomputeScheduled) {
      return;
    }
    this.recomputeScheduled = true;
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.runDebouncedRecompute();
    }, KPI_RECOMPUTE_DEBOUNCE_MS);
  }

  private async runDebouncedRecompute(): Promise<void> {
    this.recomputeScheduled = false;
    if (this.recomputing) {
      this.needsAnotherAfterRun = true;
      return;
    }
    this.recomputing = true;
    try {
      await this.recompute();
    } finally {
      this.recomputing = false;
      if (this.needsAnotherAfterRun) {
        this.needsAnotherAfterRun = false;
        this.scheduleRecompute();
      }
    }
  }

  /**
   * Loads fleet, runs pure KPI calculator, updates cache, emits if changed.
   */
  async recompute(): Promise<void> {
    this.log.debug('KPI recompute started');
    const fleet = await this.ships.listAllShipsOrdered();
    const sources = fleet.map(shipToClassificationSource);
    const snapshot = this.kpi.buildSnapshot(sources);
    this.emitUpdate(snapshot);
    this.log.debug('KPI recompute finished');
  }

  /**
   * Publishes to GraphQL PubSub and internal EventEmitter when the snapshot changed (shallow JSON).
   */
  emitUpdate(snapshot: KpiSnapshot): void {
    if (snapshotsShallowEqual(this.currentSnapshot, snapshot)) {
      return;
    }
    this.currentSnapshot = snapshot;
    void this.pubSub.publish(KPI_UPDATED_TOPIC, { kpiUpdated: snapshot });
    this.internalEvents.emit(KPI_UPDATED_INTERNAL, snapshot);
    this.log.debug('KPI snapshot emitted');
  }

  /** Query resolver: lazy first compute when cache is cold. */
  async getSnapshotOrComputeOnce(): Promise<KpiSnapshot> {
    if (this.currentSnapshot !== null) {
      return this.currentSnapshot;
    }
    await this.recompute();
    return this.currentSnapshot!;
  }
}

/** Tolerance for comparing aggregated floats (KPI emit deduplication). */
const EPSILON = 0.0001;

function numbersEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

function snapshotsShallowEqual(
  a: KpiSnapshot | null,
  b: KpiSnapshot,
): boolean {
  if (a === null) {
    return false;
  }
  return (
    a.computedAt === b.computedAt &&
    maritimeKpisEqual(a.maritime, b.maritime) &&
    financialKpisEqual(a.financial, b.financial)
  );
}

function numberRecordsEqual(
  x: Record<string, number>,
  y: Record<string, number>,
): boolean {
  const keysX = Object.keys(x);
  const keysY = Object.keys(y);
  if (keysX.length !== keysY.length) {
    return false;
  }
  for (const k of keysX) {
    if (!(k in y)) {
      return false;
    }
    if (!numbersEqual(x[k], y[k])) {
      return false;
    }
  }
  for (const k of keysY) {
    if (!(k in x)) {
      return false;
    }
  }
  return true;
}

function maritimeKpisEqual(a: MaritimeKpis, b: MaritimeKpis): boolean {
  return (
    a.totalVessels === b.totalVessels &&
    a.delayedVessels === b.delayedVessels &&
    a.totalDeadweightTonnage === b.totalDeadweightTonnage &&
    a.totalLNGVolume === b.totalLNGVolume &&
    numbersEqual(a.totalDelayHours, b.totalDelayHours) &&
    numbersEqual(a.averageDelayTimeHours, b.averageDelayTimeHours) &&
    numberRecordsEqual(a.vesselsByType, b.vesselsByType) &&
    numberRecordsEqual(a.delayedVesselsByType, b.delayedVesselsByType) &&
    numberRecordsEqual(a.volumeByCargoType, b.volumeByCargoType)
  );
}

function financialKpisEqual(a: FinancialKpis, b: FinancialKpis): boolean {
  return (
    numbersEqual(a.estimatedOilValue, b.estimatedOilValue) &&
    numbersEqual(a.estimatedLngValue, b.estimatedLngValue) &&
    numbersEqual(a.totalCargoValue, b.totalCargoValue) &&
    numberRecordsEqual(a.valueByCargoType, b.valueByCargoType)
  );
}

/** Nest DI: map token to orchestrator instance. */
export const kpiRefreshSchedulerProvider = {
  provide: KPI_REFRESH_SCHEDULER,
  useExisting: KpiOrchestratorService,
};
