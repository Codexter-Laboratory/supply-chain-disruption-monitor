import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { HttpClientPort } from '../../shared/http/http-client.port';
import { HttpClientModule, HTTP_CLIENT } from '../../shared/http/http.module';
import { NEWS_FEED_PROVIDER } from '../application/news-feed.provider.port';
import { NEWS_ITEM_REPOSITORY } from '../application/news-item.repository.port';
import { NewsApplicationService } from '../application/news.application.service';
import { MockNewsFeedProvider } from '../infrastructure/mock-news-feed.provider';
import { PrismaNewsItemRepository } from '../infrastructure/prisma-news-item.repository';
import { RssNewsFeedProvider } from '../infrastructure/rss-news-feed.provider';
import { NewsResolver } from './news.resolver';

@Module({
  imports: [HttpClientModule],
  providers: [
    NewsApplicationService,
    NewsResolver,
    { provide: NEWS_ITEM_REPOSITORY, useClass: PrismaNewsItemRepository },
    {
      provide: NEWS_FEED_PROVIDER,
      useFactory: (config: ConfigService, http: HttpClientPort) => {
        const url = config.get<string>('NEWS_RSS_URL')?.trim();
        return url ? new RssNewsFeedProvider(url, http) : new MockNewsFeedProvider();
      },
      inject: [ConfigService, HTTP_CLIENT],
    },
  ],
  exports: [NewsApplicationService],
})
export class NewsModule {}
