import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { fetchShipsPage } from '../../../services/api/ships';

const PAGE_SIZE = 8;

export function useShips() {
  const [offset, setOffset] = useState(0);

  const query = useQuery({
    queryKey: ['ships', { offset, limit: PAGE_SIZE }] as const,
    queryFn: () => fetchShipsPage({ offset, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const page = query.data;

  const canPrev = offset > 0;
  const canNext = page ? offset + PAGE_SIZE < page.total : false;

  const goPrev = useCallback(() => {
    setOffset((o) => Math.max(0, o - PAGE_SIZE));
  }, []);

  const goNext = useCallback(() => {
    setOffset((o) => o + PAGE_SIZE);
  }, []);

  const rangeLabel = useMemo(() => {
    if (!page) return '';
    const start = page.total === 0 ? 0 : page.offset + 1;
    const end = Math.min(page.offset + page.items.length, page.total);
    return `${start}–${end} of ${page.total}`;
  }, [page]);

  return {
    page: page ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    canPrev,
    canNext,
    goPrev,
    goNext,
    rangeLabel,
    pageSize: PAGE_SIZE,
  };
}
