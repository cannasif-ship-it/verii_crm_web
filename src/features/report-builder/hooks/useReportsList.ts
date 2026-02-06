import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { reportsApi } from '../api/reports-api';
import type { ReportDto } from '../types';
import { reportBuilderQueryKeys, REPORTS_LIST_STALE_TIME_MS } from '../utils/query-keys';

export function useReportsList(search: string | undefined): UseQueryResult<ReportDto[], Error> {
  return useQuery({
    queryKey: reportBuilderQueryKeys.list(search ?? undefined),
    queryFn: () => reportsApi.list(search ?? undefined),
    staleTime: REPORTS_LIST_STALE_TIME_MS,
  });
}
