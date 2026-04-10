import { RealtimePayload } from '../domain/realtime-payload';

export const REALTIME_PUBLISHER = Symbol('REALTIME_PUBLISHER');

export interface RealtimePublisherPort {
  publish(payload: RealtimePayload): Promise<void>;
}
