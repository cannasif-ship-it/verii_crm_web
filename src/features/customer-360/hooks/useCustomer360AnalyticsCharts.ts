import { useQuery } from '@tanstack/react-query';
import { getAnalyticsCharts } from '../api/customer360.api';

const STALE_TIME_MS = 30_000;

export function useCustomer360AnalyticsCharts(customerId: number, months = 12) {
  return useQuery({
    queryKey: ['customer-360', 'analytics-charts', customerId, months],
    queryFn: () => getAnalyticsCharts(customerId, months),
    staleTime: STALE_TIME_MS,
    enabled: customerId > 0,
  });
}
