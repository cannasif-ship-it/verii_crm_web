import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  QuotationBulkCreateDto,
  QuotationGetDto,
  PriceOfProductDto,
  PriceOfProductRequestDto,
  PricingRuleLineGetDto,
} from '../types/quotation-types';
import { queryKeys } from '../utils/query-keys';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useShippingAddressesByCustomer } from '@/features/shipping-address-management/hooks/useShippingAddressesByCustomer';
import { useUserList } from '@/features/user-management/hooks/useUserList';
import { usePaymentTypeList } from '@/features/payment-type-management/hooks/usePaymentTypeList';
import { useErpProducts } from '@/services/hooks/useErpProducts';
import type { ApprovalStatus } from '../types/quotation-types';

export const quotationApi = {
  createBulk: async (data: QuotationBulkCreateDto): Promise<ApiResponse<QuotationGetDto>> => {
    try {
      const response = await api.post<ApiResponse<QuotationGetDto>>(
        '/api/quotation/bulk-quotation',
        data
      );
      return response;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        if (axiosError.response?.data) {
          throw new Error(JSON.stringify(axiosError.response.data));
        }
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<QuotationGetDto> => {
    const response = await api.get<ApiResponse<QuotationGetDto>>(`/api/quotation/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Teklif detayı yüklenemedi');
  },

  canEdit: async (id: number): Promise<boolean> => {
    const response = await api.get<ApiResponse<boolean>>(`/api/approval/quotation/${id}/can-edit`);
    if (response.success && response.data !== undefined) {
      return response.data;
    }
    return false;
  },

  getApprovalStatus: async (id: number): Promise<ApprovalStatus> => {
    const response = await api.get<ApiResponse<ApprovalStatus>>(
      `/api/approval/quotation/${id}/status`
    );
    if (response.success && response.data !== undefined) {
      return response.data;
    }
    throw new Error(response.message || 'Onay durumu yüklenemedi');
  },

  getPriceOfProduct: async (requests: PriceOfProductRequestDto[]): Promise<PriceOfProductDto[]> => {
    if (!requests || requests.length === 0) {
      return [];
    }

    try {
      const queryParams = new URLSearchParams();
      requests.forEach((req, index) => {
        queryParams.append(`request[${index}].productCode`, req.productCode);
        queryParams.append(`request[${index}].groupCode`, req.groupCode);
      });

      const url = `/api/quotation/price-of-product?${queryParams.toString()}`;
      const response = await api.get<ApiResponse<PriceOfProductDto[]>>(url);

      if (!response) {
        throw new Error('API response bulunamadı');
      }

      if (response.statusCode && response.statusCode !== 200) {
        throw new Error(response.message || `HTTP ${response.statusCode}: Ürün fiyatı yüklenemedi`);
      }

      if (!response.success) {
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        } else {
          return [];
        }
      }

      if (!response.data) {
        return [];
      }

      if (!Array.isArray(response.data)) {
        throw new Error('API\'den beklenmeyen veri formatı döndü');
      }

      const mappedData = response.data.map((item: unknown) => {
        const priceItem = item as Record<string, unknown>;
        return {
          productCode: (priceItem.productCode as string) || (priceItem.ProductCode as string) || '',
          groupCode: (priceItem.groupCode as string) || (priceItem.GroupCode as string) || '',
          currency: (priceItem.currency as string) || (priceItem.Currency as string) || '',
          listPrice: (priceItem.listPrice as number) ?? (priceItem.ListPrice as number) ?? 0,
          costPrice: (priceItem.costPrice as number) ?? (priceItem.CostPrice as number) ?? 0,
          discount1: (priceItem.discount1 as number | null) ?? (priceItem.Discount1 as number | null) ?? null,
          discount2: (priceItem.discount2 as number | null) ?? (priceItem.Discount2 as number | null) ?? null,
          discount3: (priceItem.discount3 as number | null) ?? (priceItem.Discount3 as number | null) ?? null,
        };
      });

      return mappedData;
    } catch (error) {
      throw error;
    }
  },

  getPriceRuleOfQuotation: async (
    customerCode: string,
    salesmenId: number,
    quotationDate: string
  ): Promise<PricingRuleLineGetDto[]> => {
    try {
      const queryParams = new URLSearchParams({
        customerCode,
        salesmenId: salesmenId.toString(),
        quotationDate,
      });

      const url = `/api/quotation/price-rule-of-quotation?${queryParams.toString()}`;
      const response = await api.get<ApiResponse<PricingRuleLineGetDto[]>>(url);

      if (!response) {
        throw new Error('API response bulunamadı');
      }

      if (response.statusCode && response.statusCode !== 200) {
        throw new Error(response.message || `HTTP ${response.statusCode}: Fiyat kuralları yüklenemedi`);
      }

      if (!response.success) {
        return [];
      }

      if (!response.data) {
        return [];
      }

      if (!Array.isArray(response.data)) {
        throw new Error('API\'den beklenmeyen veri formatı döndü');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const useCreateQuotationBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuotationBulkCreateDto) => quotationApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations() });
    },
  });
};

export const useQuotation = (id: number) => {
  return useQuery({
    queryKey: queryKeys.quotation(id),
    queryFn: () => quotationApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCanEditQuotation = (quotationId: number) => {
  return useQuery({
    queryKey: queryKeys.canEdit(quotationId),
    queryFn: () => quotationApi.canEdit(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuotationApprovalStatus = (quotationId: number) => {
  return useQuery({
    queryKey: queryKeys.approvalStatus(quotationId),
    queryFn: () => quotationApi.getApprovalStatus(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomers = () => {
  const { data, isLoading } = useCustomerOptions();
  return {
    data: data?.map((customer) => ({
      id: customer.id,
      name: customer.name,
      customerCode: customer.customerCode,
      erpCode: customer.customerCode,
    })) || [],
    isLoading,
  };
};

export const useShippingAddresses = (customerId?: number) => {
  const { data, isLoading } = useShippingAddressesByCustomer(customerId || 0);
  return {
    data:
      data?.map((address) => ({
        id: address.id,
        addressText: address.address,
        customerId: address.customerId,
      })) || [],
    isLoading,
  };
};

export const useUsers = () => {
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

export const usePaymentTypes = () => {
  const { data, isLoading } = usePaymentTypeList({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'Name',
    sortDirection: 'asc',
  });
  return {
    data:
      data?.data?.map((paymentType) => ({
        id: paymentType.id,
        name: paymentType.name,
      })) || [],
    isLoading,
  };
};

export const useProducts = (search?: string) => {
  const { data: erpProducts, isLoading: erpLoading } = useErpProducts(search);

  return {
    data:
      erpProducts?.map((product, index) => {
        const subeKodu = product.subeKodu || 0;
        const isletmeKodu = product.isletmeKodu || 0;
        const id = subeKodu * 1000000 + isletmeKodu || index;
        return {
          id: isNaN(id) ? index : id,
          code: product.stokKodu || '',
          name: product.stokAdi || product.grupKodu || '',
          vatRate: 18,
          groupCode: product.grupKodu || '',
        };
      }) || [],
    isLoading: erpLoading,
  };
};

export const usePriceOfProduct = (productCode?: string, groupCode?: string, enabled = false) => {
  return useQuery({
    queryKey: ['priceOfProduct', productCode, groupCode],
    queryFn: () => quotationApi.getPriceOfProduct(productCode || '', groupCode || ''),
    enabled: enabled && !!productCode && !!groupCode,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePriceRuleOfQuotation = (
  customerCode: string | null | undefined,
  salesmenId: number | null | undefined,
  quotationDate: string | null | undefined
) => {
  const enabled = !!customerCode && !!salesmenId && !!quotationDate;

  return useQuery({
    queryKey: queryKeys.priceRuleOfQuotation(
      customerCode || '',
      salesmenId || 0,
      quotationDate || ''
    ),
    queryFn: () => quotationApi.getPriceRuleOfQuotation(
      customerCode!,
      salesmenId!,
      quotationDate!
    ),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};
