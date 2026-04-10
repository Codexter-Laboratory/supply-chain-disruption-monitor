import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  NewsItemRepositoryPort,
  type NewNewsItemRecord,
} from '../application/news-item.repository.port';
import type { NewsItem } from '../domain/news-item.entity';
import { newsItemFromPrismaRow } from './news-item.prisma-mapper';

@Injectable()
export class PrismaNewsItemRepository implements NewsItemRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByUrl(record: NewNewsItemRecord): Promise<NewsItem> {
    const row = await this.prisma.newsItem.upsert({
      where: { url: record.url },
      create: {
        title: record.title,
        source: record.source,
        timestamp: record.timestamp,
        summary: record.summary,
        url: record.url,
      },
      update: {},
    });
    return newsItemFromPrismaRow(row);
  }

  async findRecent(limit: number): Promise<readonly NewsItem[]> {
    const rows = await this.prisma.newsItem.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return rows.map(newsItemFromPrismaRow);
  }
}
