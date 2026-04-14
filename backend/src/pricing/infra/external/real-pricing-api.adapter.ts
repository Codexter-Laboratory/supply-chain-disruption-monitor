import { Logger } from '@nestjs/common';
import type { ExternalPricingApiPort } from '../../application/external-pricing-api.port';
import type { HttpClientPort } from '../../../shared/http/http-client.port';
import { getExternalPricingConfig } from '../../config/external-pricing.config';

export class RealPricingApiAdapter implements ExternalPricingApiPort {
  private readonly log = new Logger(RealPricingApiAdapter.name);

  constructor(private readonly http: HttpClientPort) {}

  async fetchLatestPrices(): Promise<Record<string, number>> {
    void getExternalPricingConfig();
    void this.http;

    this.log.warn(
      'RealPricingApiAdapter.fetchLatestPrices() called but not implemented yet',
    );

    throw new Error('External pricing API not implemented yet');
  }
}
