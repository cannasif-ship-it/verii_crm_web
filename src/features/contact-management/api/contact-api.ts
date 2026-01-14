import { api } from '@/lib/axios';
import type { ApiResponse, PagedResponse, PagedParams, PagedFilter } from '@/types/api';
import type { ContactDto, CreateContactDto, UpdateContactDto } from '../types/contact-types';

export const contactApi = {
  getList: async (params: PagedParams & { filters?: PagedFilter[] | Record<string, unknown> }): Promise<PagedResponse<ContactDto>> => {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.filters) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const response = await api.get<ApiResponse<PagedResponse<ContactDto>>>(
      `/api/Contact?${queryParams.toString()}`
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
    throw new Error(response.message || 'İletişim listesi yüklenemedi');
  },

  getById: async (id: number): Promise<ContactDto> => {
    const response = await api.get<ApiResponse<ContactDto>>(`/api/Contact/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'İletişim detayı yüklenemedi');
  },

  create: async (data: CreateContactDto): Promise<ContactDto> => {
    const response = await api.post<ApiResponse<ContactDto>>('/api/Contact', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'İletişim oluşturulamadı');
  },

  update: async (id: number, data: UpdateContactDto): Promise<ContactDto> => {
    const response = await api.put<ApiResponse<ContactDto>>(`/api/Contact/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'İletişim güncellenemedi');
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(`/api/Contact/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'İletişim silinemedi');
    }
  },
};
