import { LiveSupplyChainPanel } from '../features/ships/components/LiveSupplyChainPanel';
import { useSupplyChainEventSubscription } from '../features/ships/hooks/useSupplyChainEventSubscription';
import { EnergyTrendChart } from '../features/pricing/components/EnergyTrendChart';
import { useEnergyPriceTrend } from '../features/pricing/hooks/useEnergyPriceTrend';
import { NewsFeed } from '../features/news/components/NewsFeed';
import { useRecentNews } from '../features/news/hooks/useRecentNews';
import { ShipMap } from '../features/map/components/ShipMap';
import { useShipRealtimeMap } from '../features/map/hooks/useShipRealtimeMap';
import { useShipsMapData } from '../features/map/hooks/useShipsMapData';

export function Dashboard() {
  const { events } = useSupplyChainEventSubscription();

  const mapData = useShipsMapData();
  const { points: mapPoints } = useShipRealtimeMap(
    mapData.points,
    mapData.dataUpdatedAt,
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
            className="panel panel--main ship-map-panel"
            aria-label="Fleet map"
          >
            <div className="panel-head">
              <h2 className="section-title">Fleet map</h2>
              <span className="badge">Live status</span>
            </div>
            <ShipMap
              points={mapPoints}
              mapboxToken={mapboxToken}
              isLoading={mapData.isLoading}
              error={mapData.error as Error | null}
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
          <LiveSupplyChainPanel events={events} />
        </aside>
      </div>
    </div>
  );
}
