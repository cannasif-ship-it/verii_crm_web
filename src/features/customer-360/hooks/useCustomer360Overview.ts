import { useQuery } from '@tanstack/react-query';
import { getOverview } from '../api/customer360.api';

const CUSTOMER_360_OVERVIEW_STALE_MS = 30_000;

export function useCustomer360Overview(customerId: number) {
  return useQuery({
    queryKey: ['customer-360', 'overview', customerId],
    queryFn: () => getOverview(customerId),
    staleTime: CUSTOMER_360_OVERVIEW_STALE_MS,
    enabled: customerId > 0,
  });
}
