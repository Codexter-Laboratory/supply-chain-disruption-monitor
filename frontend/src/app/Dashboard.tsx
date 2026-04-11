import { useCallback, useState } from 'react';
import { LiveSupplyChainPanel } from '../features/ships/components/LiveSupplyChainPanel';
import { ShipsList } from '../features/ships/components/ShipsList';
import { useSupplyChainEventSubscription } from '../features/ships/hooks/useSupplyChainEventSubscription';
import { useShips } from '../features/ships/hooks/useShips';
import { EnergyTrendChart } from '../features/pricing/components/EnergyTrendChart';
import { useEnergyPriceTrend } from '../features/pricing/hooks/useEnergyPriceTrend';
import { NewsFeed } from '../features/news/components/NewsFeed';
import { useRecentNews } from '../features/news/hooks/useRecentNews';
import { ShipMap } from '../features/map/components/ShipMap';
import { useShipMapFeatureCollection } from '../features/map/hooks/useShipMapFeatureCollection';
import { useShipRealtimeMap } from '../features/map/hooks/useShipRealtimeMap';
import { useShipsInView } from '../features/map/hooks/useShipsInView';
import type { MapViewportBounds } from '../features/map/types';
import dashboardStyles from './Dashboard.module.css';

export function Dashboard() {
  const { events } = useSupplyChainEventSubscription();
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

  const trend = useEnergyPriceTrend('OIL');
  const news = useRecentNews();

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Supply chain monitor</h1>
        <p className="muted">
          Operations view — live GraphQL subscriptions and cached queries (Vite
          proxy to API :3000).
        </p>
      </header>

      <div className="dashboard-layout">
        <main className="dashboard-main">
          <section
            className={`${dashboardStyles.shipMapPanel} panel panel--main`}
            aria-label="Fleet map"
          >
            <div className="panel-head">
              <h2 className="section-title">Fleet map</h2>
              <span className="badge">Live status</span>
            </div>
            <ShipMap
              featureCollection={shipFeatureCollection}
              mapboxToken={mapboxToken}
              isLoading={mapData.isLoading}
              isRefreshing={mapData.isFetching && mapPoints.length > 0}
              error={mapData.error as Error | null}
              onViewportBoundsChange={handleViewportBoundsChange}
            />
          </section>
        </main>

        <aside className="dashboard-side" aria-label="Sidebar">
          <EnergyTrendChart
            kind={trend.data?.kind ?? 'OIL'}
            points={trend.data?.points ?? []}
            simpleTrend={trend.data?.simpleTrend ?? 'FLAT'}
            isLoading={trend.isLoading}
            error={trend.error as Error | null}
          />
          <NewsFeed
            items={news.data ?? []}
            isLoading={news.isLoading}
            error={news.error as Error | null}
          />
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
          <LiveSupplyChainPanel events={events} />
        </aside>
      </div>
    </div>
  );
}
