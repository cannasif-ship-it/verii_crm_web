import { useQuery } from '@tanstack/react-query';
import { countryApi } from '../api/country-api';
import type { CountryDto } from '../types/country-types';

export const useCountryOptions = (): ReturnType<typeof useQuery<CountryDto[]>> => {
  return useQuery({
    queryKey: ['countryOptions'],
    queryFn: async (): Promise<CountryDto[]> => {
      console.log('useCountryOptions - Request params:', {
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Name',
        sortDirection: 'asc',
      });
      const response = await countryApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Name',
        sortDirection: 'asc',
      });
      console.log('useCountryOptions - Response:', response);
      console.log('useCountryOptions - Response.data:', response.data);
      const result = response.data || [];
      console.log('useCountryOptions - Returning:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
};
