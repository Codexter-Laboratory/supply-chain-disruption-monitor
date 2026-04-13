import type { NewsItem } from '../../../types/api';
import feedback from '../../../styles/feedback.module.css';
import styles from './NewsFeed.module.css';

export interface NewsFeedProps {
  items: NewsItem[];
  isLoading: boolean;
  error?: Error | null;
}

export function NewsFeed({ items, isLoading, error }: NewsFeedProps) {
  return (
    <section className="dashboard-section panel panel--stacked panel--newsScroll">
      <div className="panel-head">
        <h2 className="section-title">News</h2>
        <span className="muted">Latest headlines</span>
      </div>

      <div className="panel-body">
        {error ? (
          <p className={feedback.stateMessageError} role="alert">
            {error.message}
          </p>
        ) : null}

        {isLoading ? (
          <div className={feedback.stateMessageLoading}>
            <span className={feedback.spinner} aria-hidden />
            <span>Loading news…</span>
          </div>
        ) : (
          <>
            <ul className={styles.newsList}>
              {items.map((n) => (
                <li key={n.id}>
                  <a href={n.url} target="_blank" rel="noreferrer">
                    {n.title}
                  </a>
                  <div className={styles.meta}>
                    <span>{n.source}</span>
                    <span className="muted">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className={styles.summary}>{n.summary}</p>
                </li>
              ))}
            </ul>
            {items.length === 0 && !error ? (
              <p className={feedback.stateMessageEmpty}>
                No data available. Enable simulation news ingestion.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
