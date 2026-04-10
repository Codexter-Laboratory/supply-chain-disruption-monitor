import type { NewsItem } from '../domain/news-item.entity';

export const NEWS_ITEM_REPOSITORY = Symbol('NEWS_ITEM_REPOSITORY');

export type NewNewsItemRecord = {
  readonly title: string;
  readonly source: string;
  readonly timestamp: Date;
  readonly summary: string;
  readonly url: string;
};

export interface NewsItemRepositoryPort {
  /** Insert or return existing row when `url` already exists (dedupe). */
  upsertByUrl(record: NewNewsItemRecord): Promise<NewsItem>;
  findRecent(limit: number): Promise<readonly NewsItem[]>;
}
