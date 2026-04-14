import { useCallback, useMemo, useState } from 'react';
import { LiveSupplyChainPanel } from '../features/events/components/LiveSupplyChainPanel';
import { useSupplyChainEventSubscription } from '../features/events/hooks/useSupplyChainEventSubscription';
import { mapSupplyChainEventToRow } from '../features/events/mappers/supply-chain-event.mapper';
import { ShipsList } from '../features/ships/components/ShipsList';
import { useShips } from '../features/ships/hooks/useShips';
import { EnergyTrendChart } from '../features/pricing/components/EnergyTrendChart';
import { useEnergyPriceTrend } from '../features/pricing/hooks/useEnergyPriceTrend';
import {
  COMMODITY_OPTIONS,
  DEFAULT_ENERGY_TREND_COMMODITY,
  parseCommodityType,
} from '../features/pricing/pricing.constants';
import type { CommodityType } from '../types/api';
import { NewsFeed } from '../features/news/components/NewsFeed';
import { useRecentNews } from '../features/news/hooks/useRecentNews';
import { AlertsPanel } from '../features/alerts/components/AlertsPanel';
import { KpiPanel } from '../features/kpi/components/KpiPanel';
import { useKpi } from '../features/kpi/hooks/useKpi';
import { useKpiSubscription } from '../features/kpi/hooks/useKpiSubscription';
import { mapKpiSnapshotToPanelView } from '../features/kpi/mappers/kpi.mapper';
import { ShipMap } from '../features/map/components/ShipMap';
import { useShipMapFeatureCollection } from '../features/map/hooks/useShipMapFeatureCollection';
import { useShipRealtimeMap } from '../features/map/hooks/useShipRealtimeMap';
import { useShipsInView } from '../features/map/hooks/useShipsInView';
import type { MapViewportBounds } from '../features/map/types';
import dashboardStyles from './Dashboard.module.css';

export function Dashboard() {
  const [energyCommodity, setEnergyCommodity] = useState<CommodityType>(
    DEFAULT_ENERGY_TREND_COMMODITY,
  );

  const liveEvents = useSupplyChainEventSubscription();
  const eventRows = useMemo(
    () => liveEvents.map(mapSupplyChainEventToRow),
    [liveEvents],
  );
  const shipsPage = useShips();

  const [viewportBounds, setViewportBounds] =
    useState<MapViewportBounds | null>(null);
  const handleViewportBoundsChange = useCallback(
    (b: MapViewportBounds) => setViewportBounds(b),
    [],
  );

  const mapData = useShipsInView(viewportBounds);
  const { points: mapPoints, highlightedShipIds } = useShipRealtimeMap(
    mapData.points,
    mapData.dataUpdatedAt,
  );
  const shipFeatureCollection = useShipMapFeatureCollection(
    mapPoints,
    highlightedShipIds,
  );

  const trend = useEnergyPriceTrend(energyCommodity);
  const news = useRecentNews();
  const kpi = useKpi();
  useKpiSubscription();
  const kpiView = useMemo(
    () => (kpi.data ? mapKpiSnapshotToPanelView(kpi.data) : null),
    [kpi.data],
  );
  const alerts = kpi.data?.alerts ?? [];

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  return (
    <div className={dashboardStyles.rootGrid}>
      <header
        className={`${dashboardStyles.headerBand} ${dashboardStyles.pageHeader}`}
      >
        <div className={dashboardStyles.headerLead}>
          <h1 className={dashboardStyles.headerTitle}>
            Global Supply Chain Monitor
          </h1>
          <p className={dashboardStyles.headerSubtitle}>
            Monitoring vessel delays, cargo value, and energy flows in real time
          </p>
        </div>
        <div
          className={dashboardStyles.liveStatus}
          role="status"
          aria-label="Live data"
        >
          <span className={dashboardStyles.liveDot} aria-hidden />
          <span className={dashboardStyles.liveLabel}>LIVE</span>
          <span className={dashboardStyles.liveTimestamp}>Updated just now</span>
        </div>
      </header>

      <section
        className={`${dashboardStyles.mapRow} ${dashboardStyles.mapPane} panel panel--main`}
        aria-label="Fleet map"
      >
        <div className={`panel-head ${dashboardStyles.mapPanelHead}`}>
          <h2 className="section-title">Fleet map</h2>
          <span className="badge">Live status</span>
        </div>
        <div className={dashboardStyles.mapBody}>
          <ShipMap
            featureCollection={shipFeatureCollection}
            mapboxToken={mapboxToken}
            isLoading={mapData.isLoading}
            isRefreshing={mapData.isFetching && mapPoints.length > 0}
            error={mapData.error as Error | null}
            onViewportBoundsChange={handleViewportBoundsChange}
          />
        </div>
      </section>

      <div className={dashboardStyles.kpiShipsRow}>
        <div className={dashboardStyles.kpiSlot}>
          <KpiPanel
            view={kpiView}
            isLoading={kpi.isLoading}
            error={kpi.error}
          />
        </div>
        <div className={dashboardStyles.shipsSlot}>
          <ShipsList
            ships={shipsPage.page?.items ?? []}
            rangeLabel={shipsPage.rangeLabel}
            canPrev={shipsPage.canPrev}
            canNext={shipsPage.canNext}
            isLoading={shipsPage.isLoading}
            isFetching={shipsPage.isFetching}
            onPrev={shipsPage.goPrev}
            onNext={shipsPage.goNext}
            highlightedShipIds={highlightedShipIds}
            error={shipsPage.error as Error | null}
          />
        </div>
      </div>

      <div className={dashboardStyles.energyEventsRow}>
        <div className={dashboardStyles.energySlot}>
          <EnergyTrendChart
            kind={trend.data?.kind ?? energyCommodity}
            points={trend.data?.points ?? []}
            simpleTrend={trend.data?.simpleTrend ?? 'FLAT'}
            isLoading={trend.isLoading}
            error={trend.error as Error | null}
            headerRight={
              <div className={dashboardStyles.energyFilterInline}>
                <label
                  htmlFor="dashboard-energy-commodity"
                  className={dashboardStyles.energyFilterLabel}
                >
                  Commodity
                </label>
                <select
                  id="dashboard-energy-commodity"
                  className={dashboardStyles.energyFilterSelect}
                  value={energyCommodity}
                  onChange={(e) => {
                    const next = parseCommodityType(e.target.value);
                    if (next !== null) {
                      setEnergyCommodity(next);
                    }
                  }}
                  aria-label="Energy price commodity"
                >
                  {COMMODITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            }
          />
        </div>
        <div className={dashboardStyles.eventsSlot}>
          <LiveSupplyChainPanel rows={eventRows} />
        </div>
        <div className={dashboardStyles.alertsSlot}>
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      <div className={dashboardStyles.newsBand}>
        <NewsFeed
          items={news.data ?? []}
          isLoading={news.isLoading}
          error={news.error as Error | null}
        />
      </div>
    </div>
  );
}
