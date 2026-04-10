import { useEffect, useState } from 'react';
import type { SupplyChainEventCreatedPayload } from '../../../types/api';
import { getGraphqlWsClient } from '../../../services/api/client';
import { SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION } from '../../../services/api/graphql/ships';

const MAX_EVENTS = 25;

export function useSupplyChainEventSubscription() {
  const [events, setEvents] = useState<SupplyChainEventCreatedPayload[]>([]);

  useEffect(() => {
    const client = getGraphqlWsClient();
    const dispose = client.subscribe(
      { query: SUPPLY_CHAIN_EVENT_CREATED_SUBSCRIPTION },
      {
        next: (result) => {
          const row = result.data?.supplyChainEventCreated as
            | SupplyChainEventCreatedPayload
            | undefined;
          if (!row?.id) return;
          setEvents((prev) => {
            const next = [row, ...prev];
            return next.slice(0, MAX_EVENTS);
          });
        },
        error: () => {},
        complete: () => {},
      },
    );
    return () => {
      dispose();
    };
  }, []);

  return { events };
}
