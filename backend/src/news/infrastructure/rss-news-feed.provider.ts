import { Injectable, Logger } from '@nestjs/common';
import type {
  NewsFeedProviderPort,
  RawNewsArticle,
} from '../application/news-feed.provider.port';
import { parseRssItems } from './rss-items.parser';

/**
 * Fetches a single RSS/Atom-style XML feed. Falls back to empty on network/parse errors.
 */
@Injectable()
export class RssNewsFeedProvider implements NewsFeedProviderPort {
  private readonly log = new Logger(RssNewsFeedProvider.name);

  constructor(private readonly feedUrl: string) {}

  async fetchArticles(): Promise<readonly RawNewsArticle[]> {
    try {
      const res = await fetch(this.feedUrl, {
        headers: { 'User-Agent': 'SupplyChainMonitor/1.0' },
      });
      if (!res.ok) {
        this.log.warn(`RSS fetch ${res.status} for ${this.feedUrl}`);
        return [];
      }
      const xml = await res.text();
      let hostname = 'RSS';
      try {
        hostname = new URL(this.feedUrl).hostname;
      } catch {
        /* ignore */
      }
      return parseRssItems(xml, hostname);
    } catch (e) {
      this.log.warn(
        `RSS fetch failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      return [];
    }
  }
}
