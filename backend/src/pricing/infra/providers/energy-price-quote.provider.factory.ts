import type { EnergyPriceQuoteProviderPort } from '../../application/energy-price-quote.provider.port';
import { getPricingMode } from '../../config/pricing.config';
import { RealEnergyPriceQuoteProvider } from './real-energy-price-quote.provider';
import { SimulationEnergyPriceQuoteProvider } from './simulation-energy-price-quote.provider';

export function createEnergyPriceQuoteProvider(): EnergyPriceQuoteProviderPort {
  return getPricingMode() === 'real'
    ? new RealEnergyPriceQuoteProvider()
    : new SimulationEnergyPriceQuoteProvider();
}
