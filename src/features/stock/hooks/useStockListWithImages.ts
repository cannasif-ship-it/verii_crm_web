import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../api/stock-api';
import { queryKeys } from '../utils/query-keys';
import type { PagedParams, PagedFilter } from '@/types/api';
import { normalizeQueryParams } from '@/utils/query-params';

export const useStockListWithImages = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
) => {
  return useQuery({
    queryKey: queryKeys.listWithImages(normalizeQueryParams(params)),
    queryFn: () => stockApi.getListWithImages(params),
    staleTime: 5 * 60 * 1000,
  });
};
