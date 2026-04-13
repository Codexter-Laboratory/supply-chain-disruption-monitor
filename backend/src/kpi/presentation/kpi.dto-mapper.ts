import type { KpiSnapshot } from '../domain/kpi.types';
import {
  CargoValueByTypeGql,
  CargoVolumeByTypeGql,
  FinancialKpisGraphqlType,
  KpiSnapshotGraphqlType,
  MaritimeKpisGraphqlType,
  VesselsByTypeCountsGql,
} from './kpi.graphql-types';

function mapVesselsByType(m: Record<string, number>): VesselsByTypeCountsGql {
  const o = new VesselsByTypeCountsGql();
  o.CRUDE_TANKER = m.CRUDE_TANKER ?? 0;
  o.LNG_CARRIER = m.LNG_CARRIER ?? 0;
  o.LPG_CARRIER = m.LPG_CARRIER ?? 0;
  o.PRODUCT_TANKER = m.PRODUCT_TANKER ?? 0;
  o.CHEMICAL_TANKER = m.CHEMICAL_TANKER ?? 0;
  o.CONTAINER = m.CONTAINER ?? 0;
  o.BULK = m.BULK ?? 0;
  return o;
}

function mapCargoVolume(v: Record<string, number>): CargoVolumeByTypeGql {
  const o = new CargoVolumeByTypeGql();
  o.CRUDE_OIL = v.CRUDE_OIL ?? 0;
  o.LNG = v.LNG ?? 0;
  o.LPG = v.LPG ?? 0;
  o.REFINED_PRODUCTS = v.REFINED_PRODUCTS ?? 0;
  o.PETROCHEMICALS = v.PETROCHEMICALS ?? 0;
  o.DRY_BULK = v.DRY_BULK ?? 0;
  o.CONTAINER_GOODS = v.CONTAINER_GOODS ?? 0;
  return o;
}

function mapCargoValue(v: Record<string, number>): CargoValueByTypeGql {
  const o = new CargoValueByTypeGql();
  o.CRUDE_OIL = v.CRUDE_OIL ?? 0;
  o.LNG = v.LNG ?? 0;
  o.LPG = v.LPG ?? 0;
  o.REFINED_PRODUCTS = v.REFINED_PRODUCTS ?? 0;
  o.PETROCHEMICALS = v.PETROCHEMICALS ?? 0;
  o.DRY_BULK = v.DRY_BULK ?? 0;
  o.CONTAINER_GOODS = v.CONTAINER_GOODS ?? 0;
  return o;
}

export function kpiSnapshotToGraphql(snapshot: KpiSnapshot): KpiSnapshotGraphqlType {
  const maritime = new MaritimeKpisGraphqlType();
  maritime.totalVessels = snapshot.maritime.totalVessels;
  maritime.delayedVessels = snapshot.maritime.delayedVessels;
  maritime.vesselsByType = mapVesselsByType(
    snapshot.maritime.vesselsByType as Record<string, number>,
  );
  maritime.delayedVesselsByType = mapVesselsByType(
    snapshot.maritime.delayedVesselsByType as Record<string, number>,
  );
  maritime.totalDeadweightTonnage = snapshot.maritime.totalDeadweightTonnage;
  maritime.totalLNGVolume = snapshot.maritime.totalLNGVolume;
  maritime.totalDelayHours = snapshot.maritime.totalDelayHours;
  maritime.averageDelayTimeHours = snapshot.maritime.averageDelayTimeHours;
  maritime.volumeByCargoType = mapCargoVolume(
    snapshot.maritime.volumeByCargoType as Record<string, number>,
  );

  const financial = new FinancialKpisGraphqlType();
  financial.estimatedOilValue = snapshot.financial.estimatedOilValue;
  financial.estimatedLngValue = snapshot.financial.estimatedLngValue;
  financial.totalCargoValue = snapshot.financial.totalCargoValue;
  financial.valueByCargoType = mapCargoValue(
    snapshot.financial.valueByCargoType as Record<string, number>,
  );

  const root = new KpiSnapshotGraphqlType();
  root.maritime = maritime;
  root.financial = financial;
  root.computedAt = snapshot.computedAt;
  return root;
}
