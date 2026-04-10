import type { NewsItem } from '../domain/news-item.entity';
import { NewsItemGraphqlType } from './news-item.graphql-types';

export function toNewsItemGraphql(item: NewsItem): NewsItemGraphqlType {
  const dto = new NewsItemGraphqlType();
  dto.id = item.id;
  dto.title = item.title;
  dto.source = item.source;
  dto.timestamp = item.timestamp;
  dto.summary = item.summary;
  dto.url = item.url;
  return dto;
}
