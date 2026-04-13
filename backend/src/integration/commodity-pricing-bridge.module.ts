import { Module } from '@nestjs/common';
import { PricingApplicationService } from '../pricing/application/pricing.application.service';
import { PricingModule } from '../pricing/presentation/pricing.module';
import {
  COMMODITY_UNIT_PRICE_READER,
  type CommodityUnitPriceReaderPort,
} from '../kpi/application/commodity-unit-price-reader.port';

/**
 * Wires pricing into the KPI {@link COMMODITY_UNIT_PRICE_READER} token without KPI importing PricingModule.
 */
@Module({
  imports: [PricingModule],
  providers: [
    {
      provide: COMMODITY_UNIT_PRICE_READER,
      useFactory: (
        pricing: PricingApplicationService,
      ): CommodityUnitPriceReaderPort => ({
        getLatestCommodityUnitPrices: () =>
          pricing.getLatestCommodityUnitPrices(),
      }),
      inject: [PricingApplicationService],
    },
  ],
  exports: [COMMODITY_UNIT_PRICE_READER],
})
export class CommodityPricingBridgeModule {}
