import { Injectable } from '@nestjs/common';
import type {
  NewsFeedProviderPort,
  RawNewsArticle,
} from '../application/news-feed.provider.port';

@Injectable()
export class MockNewsFeedProvider implements NewsFeedProviderPort {
  private tick = 0;

  async fetchArticles(): Promise<readonly RawNewsArticle[]> {
    this.tick += 1;
    const at = new Date();
    const base = `https://example.com/supply-chain/mock/${this.tick}`;
    return [
      {
        title: `Port congestion watch — tick ${this.tick}`,
        source: 'Mock Maritime Wire',
        summary:
          'Synthetic headline for UI development. Replace with RSS or API in production.',
        url: `${base}/congestion`,
        publishedAt: at,
      },
      {
        title: `Energy route outlook ${this.tick}`,
        source: 'Mock Energy Brief',
        summary: 'Placeholder summary for list and card layouts in the client.',
        url: `${base}/energy`,
        publishedAt: at,
      },
    ];
  }
}
