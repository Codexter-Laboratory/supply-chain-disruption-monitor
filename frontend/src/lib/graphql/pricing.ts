export const ENERGY_PRICE_TREND_QUERY = `
  query EnergyPriceTrend($kind: CommodityType!, $limit: Int!) {
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

export const ENERGY_PRICE_UPDATED_SUBSCRIPTION = `
  subscription EnergyPriceUpdated {
    energyPriceUpdated {
      occurredAt
      priceId
      kind
      value
    }
  }
`;
