export const SHIPS_IN_VIEW_QUERY = `
  query ShipsInView($minLat: Float!, $maxLat: Float!, $minLng: Float!, $maxLng: Float!) {
    shipsInView(minLat: $minLat, maxLat: $maxLat, minLng: $minLng, maxLng: $maxLng) {
      id
      name
      imo
      country
      cargoType
      capacity
      currentStatus
      latitude
      longitude
    }
  }
`;

export const SHIPS_PAGE_QUERY = `
  query ShipsPage($offset: Int!, $limit: Int!) {
    ships(offset: $offset, limit: $limit) {
      total
      offset
      limit
      items {
        id
        name
        imo
        country
        cargoType
        capacity
        currentStatus
        latitude
        longitude
      }
    }
  }
`;

export const SHIP_STATUS_CHANGED_SUBSCRIPTION = `
  subscription ShipStatusChanged {
    shipStatusChanged {
      occurredAt
      shipId
      previousStatus
      newStatus
      latitude
      longitude
    }
  }
`;

export const SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION = `
  subscription SupplyChainEventCreated {
    supplyChainEventCreated {
      occurredAt
      id
      shipId
      type
      latitude
      longitude
      region
    }
  }
`;
