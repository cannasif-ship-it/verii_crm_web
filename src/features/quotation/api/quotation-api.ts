import { api } from '@/lib/axios';
import type { ApiResponse, PagedResponse, PagedParams, PagedFilter } from '@/types/api';
import type {
  QuotationBulkCreateDto,
  QuotationGetDto,
  PriceOfProductDto,
  PriceOfProductRequestDto,
  PricingRuleLineGetDto,
  UserDiscountLimitDto,
  ApprovalActionGetDto,
  ApproveActionDto,
  RejectActionDto,
  QuotationExchangeRateGetDto,
  QuotationLineGetDto,
  ApprovalStatus,
} from '../types/quotation-types';

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

  getList: async (params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }): Promise<PagedResponse<QuotationGetDto>> => {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.filters) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const response = await api.get<ApiResponse<PagedResponse<QuotationGetDto>>>(
      `/api/quotation?${queryParams.toString()}`
    );
    
    if (response.success && response.data) {
      const pagedData = response.data;
      
      const pagedDataWithItems = pagedData as PagedResponse<QuotationGetDto> & { items?: QuotationGetDto[] };
      if (pagedDataWithItems.items && !pagedData.data) {
        return {
          ...pagedData,
          data: pagedDataWithItems.items,
        };
      }
      
      return pagedData;
    }
    throw new Error(response.message || 'Teklif listesi yüklenemedi');
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

  getUserDiscountLimitsBySalespersonId: async (salespersonId: number): Promise<UserDiscountLimitDto[]> => {
    try {
      const response = await api.get<ApiResponse<UserDiscountLimitDto[]>>(
        `/api/UserDiscountLimit/salesperson/${salespersonId}`
      );
      
      if (!response.success || !response.data) {
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

  startApprovalFlow: async (data: { entityId: number; documentType: number; totalAmount: number }): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>('/api/quotation/start-approval-flow', data);
    if (!response.success) {
      throw new Error(response.message || 'Onay akışı başlatılamadı');
    }
    return response;
  },

  getWaitingApprovals: async (): Promise<ApprovalActionGetDto[]> => {
    const response = await api.get<ApiResponse<ApprovalActionGetDto[]>>('/api/quotation/waiting-approvals');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  approve: async (data: ApproveActionDto): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>('/api/quotation/approve', data);
    if (!response.success) {
      throw new Error(response.message || 'Onay işlemi gerçekleştirilemedi');
    }
    return response;
  },

  reject: async (data: RejectActionDto): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>('/api/quotation/reject', data);
    if (!response.success) {
      throw new Error(response.message || 'Red işlemi gerçekleştirilemedi');
    }
    return response;
  },

  getQuotationExchangeRatesByQuotationId: async (quotationId: number): Promise<QuotationExchangeRateGetDto[]> => {
    const response = await api.get<ApiResponse<QuotationExchangeRateGetDto[]>>(
      `/api/QuotationExchangeRate/quotation/${quotationId}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  getQuotationLinesByQuotationId: async (quotationId: number): Promise<QuotationLineGetDto[]> => {
    const response = await api.get<ApiResponse<QuotationLineGetDto[]>>(
      `/api/QuotationLine/by-quotation/${quotationId}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  updateBulk: async (id: number, data: QuotationBulkCreateDto): Promise<ApiResponse<QuotationGetDto>> => {
    try {
      const response = await api.put<ApiResponse<QuotationGetDto>>(
        `/api/quotation/bulk-quotation/${id}`,
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

  createRevisionOfQuotation: async (quotationId: number): Promise<ApiResponse<QuotationGetDto>> => {
    try {
      const response = await api.post<ApiResponse<QuotationGetDto>>(
        '/api/Quotation/revision-of-quotation',
        quotationId
      );
      if (!response.success) {
        throw new Error(response.message || 'Teklif revizyonu oluşturulamadı');
      }
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
};
