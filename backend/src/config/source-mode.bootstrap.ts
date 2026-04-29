import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getPricingMode } from '../pricing/config/pricing.config';
import {
  getEventsMode,
  getNewsMode,
  getRoutesMode,
  getVesselTrackingMode,
} from './source-mode.config';

/** Informational startup log only; reads env from `getPricingMode` and `get*Mode` helpers. */
@Injectable()
export class SourceModeBootstrap implements OnModuleInit {
  private readonly log = new Logger('SourceMode');

  onModuleInit(): void {
    this.log.log(`Pricing (${getPricingMode()})`);
    this.log.log(`News (${getNewsMode()})`);
    this.log.log(`Vessel tracking (${getVesselTrackingMode()})`);
    this.log.log(`Routes (${getRoutesMode()})`);
    this.log.log(`Events (${getEventsMode()})`);
  }
}
