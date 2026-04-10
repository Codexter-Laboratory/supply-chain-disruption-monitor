import { ShipStatusChangedRealtimeEvent } from './ship-status-changed.realtime-event';
import { SupplyChainEventCreatedRealtimeEvent } from './supply-chain-event-created.realtime-event';
import { RouteLegOpenedRealtimeEvent } from './route-leg-opened.realtime-event';
import { RouteLegClosedRealtimeEvent } from './route-leg-closed.realtime-event';
import { EnergyPriceRecordedRealtimeEvent } from './energy-price-recorded.realtime-event';
import { NewsItemsIngestedRealtimeEvent } from './news-items-ingested.realtime-event';

/** Discriminated union of all realtime payloads published to subscribers. */
export type RealtimePayload =
  | ShipStatusChangedRealtimeEvent
  | SupplyChainEventCreatedRealtimeEvent
  | RouteLegOpenedRealtimeEvent
  | RouteLegClosedRealtimeEvent
  | EnergyPriceRecordedRealtimeEvent
  | NewsItemsIngestedRealtimeEvent;
