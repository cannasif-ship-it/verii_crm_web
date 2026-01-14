import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../api/customer-api';
import type { CustomerDto } from '../types/customer-types';

export const useCustomerOptions = () => {
  return useQuery({
    queryKey: ['customerOptions'],
    queryFn: async (): Promise<CustomerDto[]> => {
      const response = await customerApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Name',
        sortDirection: 'asc',
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
