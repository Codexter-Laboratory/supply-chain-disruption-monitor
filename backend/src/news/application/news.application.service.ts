import { Inject, Injectable, Logger } from '@nestjs/common';
import type { NewsItem } from '../domain/news-item.entity';
import type { NewsFeedProviderPort, RawNewsArticle } from './news-feed.provider.port';
import { NEWS_FEED_PROVIDER } from './news-feed.provider.port';
import {
  NEWS_ITEM_REPOSITORY,
  type NewNewsItemRecord,
  type NewsItemRepositoryPort,
} from './news-item.repository.port';

const DEFAULT_RECENT_LIMIT = 30;
const MAX_RECENT_LIMIT = 200;

const MAX_TITLE = 500;
const MAX_SOURCE = 200;
const MAX_SUMMARY = 4000;

@Injectable()
export class NewsApplicationService {
  private readonly log = new Logger(NewsApplicationService.name);

  constructor(
    @Inject(NEWS_ITEM_REPOSITORY)
    private readonly items: NewsItemRepositoryPort,
    @Inject(NEWS_FEED_PROVIDER)
    private readonly feed: NewsFeedProviderPort,
  ) {}

  async listRecent(limit: number): Promise<readonly NewsItem[]> {
    const raw = Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_RECENT_LIMIT;
    const safe = Math.min(Math.max(raw, 1), MAX_RECENT_LIMIT);
    return this.items.findRecent(safe);
  }

  /** Normalize RSS/API/mock payloads, then upsert by URL (no duplicate URLs). */
  async ingestionTick(): Promise<void> {
    const batch = await this.feed.fetchArticles();
    for (const raw of batch) {
      const record = this.normalize(raw);
      if (!record) {
        this.log.debug(`Skip article with invalid URL: ${raw.url}`);
        continue;
      }
      await this.items.upsertByUrl(record);
    }
  }

  private normalize(raw: RawNewsArticle): NewNewsItemRecord | null {
    const url = raw.url.trim();
    if (!this.isHttpUrl(url)) {
      return null;
    }
    const title = raw.title.trim().slice(0, MAX_TITLE);
    const source = raw.source.trim().slice(0, MAX_SOURCE);
    if (!title || !source) {
      return null;
    }
    const summary =
      raw.summary.trim().slice(0, MAX_SUMMARY) ||
      title.slice(0, MAX_SUMMARY);
    return {
      title,
      source,
      summary,
      url,
      timestamp: raw.publishedAt,
    };
  }

  private isHttpUrl(s: string): boolean {
    try {
      const u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
