/** Unnormalized article from RSS/API/mock before application trimming. */
export type RawNewsArticle = {
  readonly title: string;
  readonly source: string;
  readonly summary: string;
  readonly url: string;
  readonly publishedAt: Date;
};

export const NEWS_FEED_PROVIDER = Symbol('NEWS_FEED_PROVIDER');

export interface NewsFeedProviderPort {
  fetchArticles(): Promise<readonly RawNewsArticle[]>;
}
