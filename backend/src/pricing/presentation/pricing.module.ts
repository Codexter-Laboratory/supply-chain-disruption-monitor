import { Module } from '@nestjs/common';
import { EXTERNAL_PRICING_API } from '../application/external-pricing-api.port';
import { PricingModeBootstrap } from '../config/pricing-mode.bootstrap';
import { ENERGY_PRICE_QUOTE_PROVIDER } from '../application/energy-price-quote.provider.port';
import { ENERGY_PRICE_REPOSITORY } from '../application/energy-price.repository.port';
import { PricingApplicationService } from '../application/pricing.application.service';
import { createEnergyPriceQuoteProvider } from '../infra/providers/energy-price-quote.provider.factory';
import { RealPricingApiAdapter } from '../infra/external/real-pricing-api.adapter';
import { PrismaEnergyPriceRepository } from '../infrastructure/prisma-energy-price.repository';
import { HttpClientModule, HTTP_CLIENT } from '../../shared/http/http.module';
import type { HttpClientPort } from '../../shared/http/http-client.port';
import { PricingResolver } from './pricing.resolver';

@Module({
  imports: [HttpClientModule],
  providers: [
    PricingApplicationService,
    PricingResolver,
    PricingModeBootstrap,
    { provide: ENERGY_PRICE_REPOSITORY, useClass: PrismaEnergyPriceRepository },
    {
      provide: ENERGY_PRICE_QUOTE_PROVIDER,
      useFactory: () => createEnergyPriceQuoteProvider(),
    },
    {
      provide: EXTERNAL_PRICING_API,
      useFactory: (http: HttpClientPort) => new RealPricingApiAdapter(http),
      inject: [HTTP_CLIENT],
    },
  ],
  exports: [PricingApplicationService],
})
export class PricingModule {}
