import type { ExternalPricingApiPort } from '../../application/external-pricing-api.port';
import type { EnergyPriceQuoteProviderPort } from '../../application/energy-price-quote.provider.port';
import { getPricingMode } from '../../config/pricing.config';
import { RealEnergyPriceQuoteProvider } from './real-energy-price-quote.provider';
import { SimulationEnergyPriceQuoteProvider } from './simulation-energy-price-quote.provider';

export function createEnergyPriceQuoteProvider(
  externalPricingApi: ExternalPricingApiPort,
): EnergyPriceQuoteProviderPort {
  return getPricingMode() === 'real'
    ? new RealEnergyPriceQuoteProvider(externalPricingApi)
    : new SimulationEnergyPriceQuoteProvider();
}
