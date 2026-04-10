import type { NewsItem } from '../../../types/api';

export interface NewsFeedProps {
  items: NewsItem[];
  isLoading: boolean;
  error?: Error | null;
}

export function NewsFeed({ items, isLoading, error }: NewsFeedProps) {
  return (
    <section className="dashboard-section panel panel--stacked">
      <div className="panel-head">
        <h2 className="section-title">News</h2>
        <span className="muted">Latest headlines</span>
      </div>

      {error ? (
        <p className="state-message state-message--error" role="alert">
          {error.message}
        </p>
      ) : null}

      {isLoading ? (
        <div className="state-message state-message--loading">
          <span className="spinner" aria-hidden />
          <span>Loading news…</span>
        </div>
      ) : (
        <>
          <ul className="news-list">
            {items.map((n) => (
              <li key={n.id}>
                <a href={n.url} target="_blank" rel="noreferrer">
                  {n.title}
                </a>
                <div className="news-meta">
                  <span>{n.source}</span>
                  <span className="muted">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="news-summary">{n.summary}</p>
              </li>
            ))}
          </ul>
          {items.length === 0 && !error ? (
            <p className="state-message state-message--empty">
              No data available. Enable simulation news ingestion.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
