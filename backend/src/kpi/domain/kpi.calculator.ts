import {
  CargoType,
  classifyVessel,
  estimateCargoVolume,
  isShipDelayed,
  VesselType,
  type CargoType as CargoTypeKey,
  type VesselType as VesselTypeKey,
} from '@supply-chain/maritime-intelligence';
import {
  effectiveCargoUnitPrices,
  financialValueForCargo,
  legacyLngLineValue,
  legacyOilBucketValue,
  lngCargoVolumeM3,
} from './conversion';
import {
  MILLISECONDS_PER_HOUR,
  type KpiComputationInput,
  type KpiSnapshot,
} from './kpi.types';

function zeroVesselsByType(): Record<VesselTypeKey, number> {
  const initial: Partial<Record<VesselTypeKey, number>> = {};
  for (const key of Object.values(VesselType) as VesselTypeKey[]) {
    initial[key] = 0;
  }
  return initial as Record<VesselTypeKey, number>;
}

function zeroCargoTypeNumbers(): Record<CargoTypeKey, number> {
  const initial: Partial<Record<CargoTypeKey, number>> = {};
  for (const key of Object.values(CargoType) as CargoTypeKey[]) {
    initial[key] = 0;
  }
  return initial as Record<CargoTypeKey, number>;
}

function delayDurationHours(
  delayStartIso: string,
  asOfMs: number,
): number | null {
  const start = Date.parse(delayStartIso);
  if (!Number.isFinite(start) || start > asOfMs) {
    return null;
  }
  return (asOfMs - start) / MILLISECONDS_PER_HOUR;
}

function sumRecordValues(rec: Record<CargoTypeKey, number>): number {
  let s = 0;
  for (const v of Object.values(rec)) {
    s += v;
  }
  return s;
}

/**
 * Pure KPI aggregation. Classifies each source via shared maritime functions.
 */
export function computeKpiSnapshot(input: KpiComputationInput): KpiSnapshot {
  const { ships, asOf } = input;
  const asOfMs = asOf.getTime();
  const unitPrices = effectiveCargoUnitPrices(input);

  const vesselsByType = zeroVesselsByType();
  const delayedVesselsByType = zeroVesselsByType();
  const volumeByCargoType = zeroCargoTypeNumbers();
  const valueByCargoType = zeroCargoTypeNumbers();

  let delayedVessels = 0;
  let totalDeadweightTonnage = 0;
  let totalLNGVolume = 0;
  const delayHoursSamples: number[] = [];
  let totalDelayHours = 0;

  for (const ship of ships) {
    const classified = classifyVessel(ship);
    const capacity = estimateCargoVolume(ship);
    const delayed = isShipDelayed(ship);

    vesselsByType[classified.vesselType] += 1;
    volumeByCargoType[classified.cargoType] += capacity.value;

    const shipValue = financialValueForCargo(
      classified.cargoType,
      capacity,
      unitPrices,
    );
    valueByCargoType[classified.cargoType] += shipValue;

    if (delayed) {
      delayedVessels += 1;
      delayedVesselsByType[classified.vesselType] += 1;
      if (classified.delayStartTime !== null) {
        const hours = delayDurationHours(classified.delayStartTime, asOfMs);
        if (hours !== null) {
          delayHoursSamples.push(hours);
          totalDelayHours += hours;
        }
      }
    }

    if (capacity.unit === 'DWT') {
      totalDeadweightTonnage += capacity.value;
    }

    totalLNGVolume += lngCargoVolumeM3(classified.cargoType, capacity);
  }

  const totalVessels = ships.length;
  const averageDelayTimeHours =
    delayHoursSamples.length === 0
      ? 0
      : delayHoursSamples.reduce((a, b) => a + b, 0) /
        delayHoursSamples.length;

  const estimatedOilValue = legacyOilBucketValue(valueByCargoType);
  const estimatedLngValue = legacyLngLineValue(valueByCargoType);
  const totalCargoValue = sumRecordValues(valueByCargoType);

  return {
    maritime: {
      totalVessels,
      delayedVessels,
      vesselsByType,
      delayedVesselsByType,
      totalDeadweightTonnage,
      totalLNGVolume,
      totalDelayHours,
      averageDelayTimeHours,
      volumeByCargoType,
    },
    financial: {
      estimatedOilValue,
      estimatedLngValue,
      totalCargoValue,
      valueByCargoType,
    },
    computedAt: asOf.toISOString(),
  };
}
