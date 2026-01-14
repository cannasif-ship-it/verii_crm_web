import { useQuery } from '@tanstack/react-query';
import { customerTypeApi } from '../api/customer-type-api';
import type { CustomerTypeDto } from '../types/customer-type-types';

export const useCustomerTypeOptions = () => {
  return useQuery({
    queryKey: ['customerTypeOptions'],
    queryFn: async (): Promise<CustomerTypeDto[]> => {
      const response = await customerTypeApi.getList({
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
