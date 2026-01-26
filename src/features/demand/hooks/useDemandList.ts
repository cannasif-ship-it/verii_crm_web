import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { PagedResponse, PagedParams, PagedFilter } from '@/types/api';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { DemandGetDto } from '../types/demand-types';

export const useDemandList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): UseQueryResult<PagedResponse<DemandGetDto>, Error> => {
  return useQuery({
    queryKey: queryKeys.demands(params),
    queryFn: () => demandApi.getList(params),
    staleTime: 2 * 60 * 1000,
  });
};
