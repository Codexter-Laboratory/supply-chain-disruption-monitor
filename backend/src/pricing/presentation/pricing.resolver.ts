import { UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { graphqlArgsValidationPipe } from '../../common/utils/graphql-args-validation.pipe';
import { PricingApplicationService } from '../application/pricing.application.service';
import { EnergyPriceGraphqlType } from './energy-price.graphql-types';
import { EnergyPriceTrendGraphqlType } from './energy-price-trend.graphql-types';
import {
  EnergyPriceTrendArgs,
  RecentEnergyPricesArgs,
} from './pricing-queries.args';
import { toEnergyPriceGraphql, toEnergyPriceTrendGraphql } from './energy-price.dto-mapper';

@Resolver(() => EnergyPriceGraphqlType)
@UsePipes(graphqlArgsValidationPipe)
export class PricingResolver {
  constructor(private readonly pricing: PricingApplicationService) {}

  @Query(() => [EnergyPriceGraphqlType], { name: 'recentEnergyPrices' })
  async recentEnergyPrices(
    @Args() args: RecentEnergyPricesArgs,
  ): Promise<EnergyPriceGraphqlType[]> {
    const rows = await this.pricing.listRecent(args.limit, args.type);
    return rows.map(toEnergyPriceGraphql);
  }

  @Query(() => EnergyPriceTrendGraphqlType, { name: 'energyPriceTrend' })
  async energyPriceTrend(
    @Args() args: EnergyPriceTrendArgs,
  ): Promise<EnergyPriceTrendGraphqlType> {
    const trend = await this.pricing.energyPriceTrend(args.kind, args.limit);
    return toEnergyPriceTrendGraphql(trend);
  }
}
