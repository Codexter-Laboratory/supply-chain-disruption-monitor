import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { EventsApplicationService } from '../events/application/events.application.service';
import { PricingApplicationService } from '../pricing/application/pricing.application.service';
import { NewsApplicationService } from '../news/application/news.application.service';

/** Fixed cadence for scaffolding; swap for SchedulerRegistry if env-driven ms is required. */
const TICK_MS = 15_000;

/**
 * Scheduler-only: calls `EventsApplicationService.simulationTick()` (and other module ticks).
 * Supply-chain persistence and realtime fan-out live in the events application layer, not here.
 */
@Injectable()
export class SupplyChainSimulationOrchestrator {
  private readonly logger = new Logger(SupplyChainSimulationOrchestrator.name);

  constructor(
    private readonly config: ConfigService,
    private readonly events: EventsApplicationService,
    private readonly pricing: PricingApplicationService,
    private readonly news: NewsApplicationService,
  ) {}

  @Interval(TICK_MS)
  runScheduledTick(): void {
    if (this.config.get<string>('SIMULATION_ENABLED') !== 'true') {
      return;
    }
    void this.executeTick();
  }

  private async executeTick(): Promise<void> {
    try {
      await this.events.simulationTick();
    } catch (err) {
      this.logger.warn(
        `Events simulation tick failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    try {
      await this.pricing.ingestionTick();
    } catch (err) {
      this.logger.warn(
        `Pricing ingestion tick failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    try {
      await this.news.ingestionTick();
    } catch (err) {
      this.logger.warn(
        `News ingestion tick failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
