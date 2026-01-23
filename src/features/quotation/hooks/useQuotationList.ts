import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { PagedResponse, PagedParams, PagedFilter } from '@/types/api';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';
import type { QuotationGetDto } from '../types/quotation-types';

export const useQuotationList = (
  params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }
): UseQueryResult<PagedResponse<QuotationGetDto>, Error> => {
  return useQuery({
    queryKey: queryKeys.quotations(params),
    queryFn: () => quotationApi.getList(params),
    staleTime: 2 * 60 * 1000,
  });
};
