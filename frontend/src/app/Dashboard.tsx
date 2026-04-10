import { LiveSupplyChainPanel } from '../features/ships/components/LiveSupplyChainPanel';
import { ShipsList } from '../features/ships/components/ShipsList';
import { useShips } from '../features/ships/hooks/useShips';
import { useShipStatusSubscription } from '../features/ships/hooks/useShipStatusSubscription';
import { useSupplyChainEventSubscription } from '../features/ships/hooks/useSupplyChainEventSubscription';
import { EnergyTrendChart } from '../features/pricing/components/EnergyTrendChart';
import { useEnergyPriceTrend } from '../features/pricing/hooks/useEnergyPriceTrend';
import { NewsFeed } from '../features/news/components/NewsFeed';
import { useRecentNews } from '../features/news/hooks/useRecentNews';

export function Dashboard() {
  const { flashShipId } = useShipStatusSubscription();
  const { events } = useSupplyChainEventSubscription();

  const ships = useShips();
  const trend = useEnergyPriceTrend('OIL');
  const news = useRecentNews();

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
          <ShipsList
            ships={ships.page?.items ?? []}
            rangeLabel={ships.rangeLabel}
            canPrev={ships.canPrev}
            canNext={ships.canNext}
            isLoading={ships.isLoading}
            isFetching={ships.isFetching}
            onPrev={ships.goPrev}
            onNext={ships.goNext}
            flashShipId={flashShipId}
            error={ships.error as Error | null}
          />
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
