import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary } from '../api/customer360.api';

const CUSTOMER_360_ANALYTICS_STALE_MS = 30_000;

export function useCustomer360AnalyticsSummary(customerId: number) {
  return useQuery({
    queryKey: ['customer-360', 'analytics-summary', customerId],
    queryFn: () => getAnalyticsSummary(customerId),
    staleTime: CUSTOMER_360_ANALYTICS_STALE_MS,
    enabled: customerId > 0,
  });
}
