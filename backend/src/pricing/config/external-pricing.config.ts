export function getExternalPricingConfig(): {
  baseUrl: string;
  apiKey: string;
} {
  return {
    baseUrl: process.env.PRICING_API_BASE_URL?.trim() ?? '',
    apiKey: process.env.PRICING_API_KEY?.trim() ?? '',
  };
}
