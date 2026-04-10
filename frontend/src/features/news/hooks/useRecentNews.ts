import { useQuery } from '@tanstack/react-query';
import { fetchRecentNews } from '../../../services/api/news';

const LIMIT = 12;

export function useRecentNews() {
  return useQuery({
    queryKey: ['recentNews', LIMIT] as const,
    queryFn: () => fetchRecentNews({ limit: LIMIT }),
  });
}
