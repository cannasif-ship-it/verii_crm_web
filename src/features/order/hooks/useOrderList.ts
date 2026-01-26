import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { PagedResponse, PagedParams, PagedFilter } from '@/types/api';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { OrderGetDto } from '../types/order-types';

export const useOrderList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): UseQueryResult<PagedResponse<OrderGetDto>, Error> => {
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: () => orderApi.getList(params),
    staleTime: 2 * 60 * 1000,
  });
};
