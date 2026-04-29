import { Injectable, Logger } from '@nestjs/common';
import type { HttpClientPort } from '../../shared/http/http-client.port';
import type {
  NewsFeedProviderPort,
  RawNewsArticle,
} from '../application/news-feed.provider.port';
import { parseRssItems } from './rss-items.parser';

/**
 * Fetches a single RSS/Atom-style XML feed via `HttpClientPort.getText` (shared timeout/policy).
 */
@Injectable()
export class RssNewsFeedProvider implements NewsFeedProviderPort {
  private readonly log = new Logger(RssNewsFeedProvider.name);

  constructor(
    private readonly feedUrl: string,
    private readonly http: HttpClientPort,
  ) {}

  async fetchArticles(): Promise<readonly RawNewsArticle[]> {
    try {
      const xml = await this.http.getText(this.feedUrl, {
        headers: { 'User-Agent': 'SupplyChainMonitor/1.0' },
      });
      let hostname = 'RSS';
      try {
        hostname = new URL(this.feedUrl).hostname;
      } catch {
        /* ignore */
      }
      return parseRssItems(xml, hostname);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const httpMatch = /^HTTP error:\s*(\d+)$/.exec(msg);
      if (httpMatch !== null) {
        this.log.warn(`RSS fetch ${httpMatch[1]} for ${this.feedUrl}`);
        return [];
      }
      this.log.warn(`RSS fetch failed: ${msg}`);
      return [];
    }
  }
}
