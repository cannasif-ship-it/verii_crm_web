import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer-api';
import { queryKeys } from '../utils/query-keys';
import type { CustomerDto } from '../types/customer-types';

export const useCustomer = (id: number) => {
  return useQuery<CustomerDto>({
    queryKey: queryKeys.detail(id),
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
