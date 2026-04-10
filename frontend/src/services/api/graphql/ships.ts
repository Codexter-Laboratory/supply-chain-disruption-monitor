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
    }
  }
`;

export const SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION = `
  subscription SupplyChainEventCreated {
    supplyChainEventCreated {
      occurredAt
      eventId
      shipId
      type
    }
  }
`;
