import type { NewsItem } from '../../types/api';
import { graphqlHttpClient } from './client';
import { RECENT_NEWS_QUERY } from './graphql/news';

export interface RecentNewsVariables {
  limit: number;
}

interface RecentNewsResponse {
  recentNews: NewsItem[];
}

export async function fetchRecentNews(
  variables: RecentNewsVariables,
): Promise<NewsItem[]> {
  const data = await graphqlHttpClient.request<RecentNewsResponse>(
    RECENT_NEWS_QUERY,
    variables,
  );
  return data.recentNews;
}
