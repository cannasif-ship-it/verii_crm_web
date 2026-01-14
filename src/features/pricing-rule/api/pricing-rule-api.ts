import { api } from '@/lib/axios';
import type { ApiResponse, PagedResponse, PagedParams, PagedFilter } from '@/types/api';
import type {
  PricingRuleHeaderGetDto,
  PricingRuleHeaderCreateDto,
  PricingRuleHeaderUpdateDto,
  PricingRuleLineGetDto,
  PricingRuleLineCreateDto,
  PricingRuleLineUpdateDto,
  PricingRuleSalesmanGetDto,
  PricingRuleSalesmanCreateDto,
  PricingRuleFilter,
} from '../types/pricing-rule-types';
import { pricingRuleQueryKeys } from '../utils/query-keys';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useUserList } from '@/features/user-management/hooks/useUserList';
import { useProducts } from '@/features/quotation/api/quotation-api';

export const pricingRuleApi = {
  getHeaders: async (params?: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }): Promise<PagedResponse<PricingRuleHeaderGetDto>> => {
    const queryParams = new URLSearchParams();
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params?.filters) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const response = await api.get<ApiResponse<PagedResponse<PricingRuleHeaderGetDto>>>(
      `/api/PricingRuleHeader?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      const pagedData = response.data;
      if ((pagedData as any).items && !pagedData.data) {
        return {
          ...pagedData,
          data: (pagedData as any).items,
        };
      }
      return pagedData;
    }
    throw new Error(response.message || 'Fiyat kuralı listesi yüklenemedi');
  },

  getHeaderById: async (id: number): Promise<PricingRuleHeaderGetDto> => {
    const response = await api.get<ApiResponse<PricingRuleHeaderGetDto>>(`/api/PricingRuleHeader/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Fiyat kuralı detayı yüklenemedi');
  },

  createHeader: async (data: PricingRuleHeaderCreateDto): Promise<PricingRuleHeaderGetDto> => {
    const response = await api.post<ApiResponse<PricingRuleHeaderGetDto>>('/api/PricingRuleHeader', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Fiyat kuralı oluşturulamadı');
  },

  updateHeader: async (id: number, data: PricingRuleHeaderUpdateDto): Promise<PricingRuleHeaderGetDto> => {
    const response = await api.put<ApiResponse<PricingRuleHeaderGetDto>>(`/api/PricingRuleHeader/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Fiyat kuralı güncellenemedi');
  },

  deleteHeader: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(`/api/PricingRuleHeader/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Fiyat kuralı silinemedi');
    }
  },

  getLinesByHeaderId: async (headerId: number): Promise<PricingRuleLineGetDto[]> => {
    const response = await api.get<ApiResponse<PricingRuleLineGetDto[]>>(`/api/PricingRuleLine/header/${headerId}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  createLine: async (data: PricingRuleLineCreateDto): Promise<PricingRuleLineGetDto> => {
    const response = await api.post<ApiResponse<PricingRuleLineGetDto>>('/api/PricingRuleLine', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Fiyat kuralı satırı oluşturulamadı');
  },

  updateLine: async (id: number, data: PricingRuleLineUpdateDto): Promise<PricingRuleLineGetDto> => {
    const response = await api.put<ApiResponse<PricingRuleLineGetDto>>(`/api/PricingRuleLine/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Fiyat kuralı satırı güncellenemedi');
  },

  deleteLine: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(`/api/PricingRuleLine/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Fiyat kuralı satırı silinemedi');
    }
  },

  getSalesmenByHeaderId: async (headerId: number): Promise<PricingRuleSalesmanGetDto[]> => {
    const response = await api.get<ApiResponse<PricingRuleSalesmanGetDto[]>>(`/api/PricingRuleSalesman/header/${headerId}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  createSalesman: async (data: PricingRuleSalesmanCreateDto): Promise<PricingRuleSalesmanGetDto> => {
    const response = await api.post<ApiResponse<PricingRuleSalesmanGetDto>>('/api/PricingRuleSalesman', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Satışçı eklenemedi');
  },

  deleteSalesman: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(`/api/PricingRuleSalesman/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Satışçı silinemedi');
    }
  },
};

export const usePricingRuleHeaders = (params?: PagedParams, filter?: PricingRuleFilter) => {
  const queryParams: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> } = {
    ...params,
    ...filter,
  };

  return useQuery({
    queryKey: pricingRuleQueryKeys.headerList(queryParams),
    queryFn: () => pricingRuleApi.getHeaders(queryParams),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePricingRuleHeader = (id: number) => {
  return useQuery({
    queryKey: pricingRuleQueryKeys.header(id),
    queryFn: () => pricingRuleApi.getHeaderById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePricingRuleHeader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PricingRuleHeaderCreateDto) => pricingRuleApi.createHeader(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.headers() });
    },
  });
};

export const useUpdatePricingRuleHeader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PricingRuleHeaderUpdateDto }) => pricingRuleApi.updateHeader(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.headers() });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.id) });
    },
  });
};

export const useDeletePricingRuleHeader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pricingRuleApi.deleteHeader(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.headers() });
    },
  });
};

export const usePricingRuleLinesByHeaderId = (headerId: number) => {
  return useQuery({
    queryKey: pricingRuleQueryKeys.lines(headerId),
    queryFn: () => pricingRuleApi.getLinesByHeaderId(headerId),
    enabled: !!headerId && headerId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePricingRuleLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PricingRuleLineCreateDto) => pricingRuleApi.createLine(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.lines(variables.pricingRuleHeaderId) });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.pricingRuleHeaderId) });
    },
  });
};

export const useUpdatePricingRuleLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PricingRuleLineUpdateDto }) => pricingRuleApi.updateLine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.lines(variables.data.pricingRuleHeaderId) });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.data.pricingRuleHeaderId) });
    },
  });
};

export const useDeletePricingRuleLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pricingRuleApi.deleteLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.all });
    },
  });
};

export const usePricingRuleSalesmenByHeaderId = (headerId: number) => {
  return useQuery({
    queryKey: pricingRuleQueryKeys.salesmen(headerId),
    queryFn: () => pricingRuleApi.getSalesmenByHeaderId(headerId),
    enabled: !!headerId && headerId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePricingRuleSalesman = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PricingRuleSalesmanCreateDto) => pricingRuleApi.createSalesman(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.salesmen(variables.pricingRuleHeaderId) });
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.header(variables.pricingRuleHeaderId) });
    },
  });
};

export const useDeletePricingRuleSalesman = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pricingRuleApi.deleteSalesman(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingRuleQueryKeys.all });
    },
  });
};

export const useCustomersForPricingRule = () => {
  const { data, isLoading } = useCustomerOptions();
  return {
    data: data || [],
    isLoading,
  };
};

export const useUsersForPricingRule = () => {
  const { data, isLoading } = useUserList({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'FirstName',
    sortDirection: 'asc',
    filters: [{ column: 'isActive', operator: 'eq', value: 'true' }],
  });
  return {
    data:
      data?.data?.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
      })) || [],
    isLoading,
  };
};

export const useProductsForPricingRule = (search?: string) => {
  return useProducts(search);
};
