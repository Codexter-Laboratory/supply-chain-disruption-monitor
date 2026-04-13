export const RECENT_NEWS_QUERY = `
  query RecentNews($limit: Int!) {
    recentNews(limit: $limit) {
      id
      title
      source
      timestamp
      summary
      url
    }
  }
`;
