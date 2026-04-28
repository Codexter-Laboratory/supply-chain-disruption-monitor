import { Logger } from '@nestjs/common';
import type { ExternalPricingApiPort } from '../../application/external-pricing-api.port';
import type { HttpClientPort } from '../../../shared/http/http-client.port';
import { getExternalPricingConfig } from '../../config/external-pricing.config';

const DEFAULT_LATEST_PRICES_URL =
  'https://api.oilpriceapi.com/v1/prices/latest';

type OilApiResponse = {
  data?: {
    price?: number;
  };
};

export class RealPricingApiAdapter implements ExternalPricingApiPort {
  private readonly log = new Logger(RealPricingApiAdapter.name);

  constructor(private readonly http: HttpClientPort) {}

  async fetchLatestPrices(): Promise<Record<string, number>> {
    const config = getExternalPricingConfig();
    const baseUrl =
      config.baseUrl.length > 0 ? config.baseUrl : DEFAULT_LATEST_PRICES_URL;

    try {
      const response = await this.http.get<OilApiResponse>(baseUrl, {
        ...(config.apiKey.length > 0
          ? { headers: { Authorization: `Token ${config.apiKey}` } }
          : {}),
      });

      const price = response?.data?.price;
      if (typeof price !== 'number' || !Number.isFinite(price)) {
        this.log.warn('Invalid oil price from API, ignoring');
        return {};
      }

      return { BRENT: price };
    } catch (err) {
      this.log.warn(
        `External pricing API failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return {};
    }
  }
}
