import type { ShipClassificationSource } from '@supply-chain/maritime-intelligence';
import type { Ship } from '../../ships/domain/ship.entity';

export function shipToClassificationSource(ship: Ship): ShipClassificationSource {
  return {
    id: ship.id,
    name: ship.name,
    cargoType: ship.cargoType,
    capacity: ship.capacity,
    currentStatus: ship.currentStatus,
    imo: ship.imo,
    latitude: ship.position.latitude,
    longitude: ship.position.longitude,
  };
}
