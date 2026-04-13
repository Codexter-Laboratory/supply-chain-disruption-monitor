import { Module } from '@nestjs/common';
import { PricingModeBootstrap } from '../config/pricing-mode.bootstrap';
import { ENERGY_PRICE_QUOTE_PROVIDER } from '../application/energy-price-quote.provider.port';
import { ENERGY_PRICE_REPOSITORY } from '../application/energy-price.repository.port';
import { PricingApplicationService } from '../application/pricing.application.service';
import { createEnergyPriceQuoteProvider } from '../infra/providers/energy-price-quote.provider.factory';
import { PrismaEnergyPriceRepository } from '../infrastructure/prisma-energy-price.repository';
import { PricingResolver } from './pricing.resolver';

@Module({
  providers: [
    PricingApplicationService,
    PricingResolver,
    PricingModeBootstrap,
    { provide: ENERGY_PRICE_REPOSITORY, useClass: PrismaEnergyPriceRepository },
    {
      provide: ENERGY_PRICE_QUOTE_PROVIDER,
      useFactory: () => createEnergyPriceQuoteProvider(),
    },
  ],
  exports: [PricingApplicationService],
})
export class PricingModule {}
