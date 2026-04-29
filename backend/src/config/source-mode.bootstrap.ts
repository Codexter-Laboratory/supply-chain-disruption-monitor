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
    this.log.log(`Source mode: pricing=${getPricingMode()}`);
    this.log.log(`Source mode: news=${getNewsMode()}`);
    this.log.log(`Source mode: vesselTracking=${getVesselTrackingMode()}`);
    this.log.log(`Source mode: routes=${getRoutesMode()}`);
    this.log.log(`Source mode: events=${getEventsMode()}`);
  }
}
