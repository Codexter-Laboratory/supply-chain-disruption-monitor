export const ENERGY_PRICE_TREND_QUERY = `
  query EnergyPriceTrend($kind: EnergyPriceKind!, $limit: Int!) {
    energyPriceTrend(kind: $kind, limit: $limit) {
      kind
      simpleTrend
      points {
        id
        type
        value
        timestamp
      }
    }
  }
`;
