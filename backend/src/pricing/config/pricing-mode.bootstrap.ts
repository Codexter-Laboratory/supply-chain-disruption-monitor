import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getPricingMode } from './pricing.config';

/** Logs active pricing mode once the pricing module is initialized. */
@Injectable()
export class PricingModeBootstrap implements OnModuleInit {
  private readonly log = new Logger('Pricing');

  onModuleInit(): void {
    const mode = getPricingMode();
    this.log.log(`Pricing mode: ${mode}`);
  }
}
