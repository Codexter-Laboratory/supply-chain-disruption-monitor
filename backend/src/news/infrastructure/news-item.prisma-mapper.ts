import type { NewsItem as PrismaNewsItemRow } from '@prisma/client';
import { NewsItem } from '../domain/news-item.entity';

export function newsItemFromPrismaRow(row: PrismaNewsItemRow): NewsItem {
  return NewsItem.restore({
    id: row.id,
    title: row.title,
    source: row.source,
    timestamp: row.timestamp,
    summary: row.summary,
    url: row.url,
  });
}
