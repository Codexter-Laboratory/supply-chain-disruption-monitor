import { useEffect, useState } from 'react';
import { subscribeSupplyChainEventCreated } from '../../../services/api/ships.api';
import type { SupplyChainEventCreatedPayload } from '../../../types/api';

const MAX_EVENTS = 50;

export function useSupplyChainEventSubscription(): SupplyChainEventCreatedPayload[] {
  const [events, setEvents] = useState<SupplyChainEventCreatedPayload[]>([]);

  useEffect(() => {
    return subscribeSupplyChainEventCreated({
      next: (row) => {
        setEvents((prev) => [row, ...prev].slice(0, MAX_EVENTS));
      },
      error: () => {
        /* non-fatal */
      },
    });
  }, []);

  return events;
}
