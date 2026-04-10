import { Module } from '@nestjs/common';
import { ENERGY_PRICE_QUOTE_PROVIDER } from '../application/energy-price-quote.provider.port';
import { ENERGY_PRICE_REPOSITORY } from '../application/energy-price.repository.port';
import { PricingApplicationService } from '../application/pricing.application.service';
import { MockEnergyPriceQuoteProvider } from '../infrastructure/mock-energy-price-quote.provider';
import { PrismaEnergyPriceRepository } from '../infrastructure/prisma-energy-price.repository';
import { PricingResolver } from './pricing.resolver';

@Module({
  providers: [
    PricingApplicationService,
    PricingResolver,
    { provide: ENERGY_PRICE_REPOSITORY, useClass: PrismaEnergyPriceRepository },
    {
      provide: ENERGY_PRICE_QUOTE_PROVIDER,
      useClass: MockEnergyPriceQuoteProvider,
    },
  ],
  exports: [PricingApplicationService],
})
export class PricingModule {}
