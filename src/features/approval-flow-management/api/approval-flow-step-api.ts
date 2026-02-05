import { api } from '@/lib/axios';
import type { ApiResponse, PagedResponse, PagedParams } from '@/types/api';
import type {
  ApprovalFlowStepGetDto,
  ApprovalFlowStepCreateDto,
  ApprovalFlowStepUpdateDto,
} from '../types/approval-flow-step-types';

export const approvalFlowStepApi = {
  getList: async (params: PagedParams): Promise<PagedResponse<ApprovalFlowStepGetDto>> => {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const response = await api.get<ApiResponse<PagedResponse<ApprovalFlowStepGetDto>>>(
      `/api/ApprovalFlowStep?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      const pagedData = response.data as PagedResponse<ApprovalFlowStepGetDto> & { items?: ApprovalFlowStepGetDto[] };

      if (pagedData.items && !pagedData.data) {
        return {
          ...pagedData,
          data: pagedData.items,
        };
      }

      return pagedData;
    }
    throw new Error(response.message || 'Onay akış adımları yüklenemedi');
  },

  getById: async (id: number): Promise<ApprovalFlowStepGetDto> => {
    const response = await api.get<ApiResponse<ApprovalFlowStepGetDto>>(
      `/api/ApprovalFlowStep/${id}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Onay akış adımı detayı yüklenemedi');
  },

  create: async (data: ApprovalFlowStepCreateDto): Promise<ApprovalFlowStepGetDto> => {
    const response = await api.post<ApiResponse<ApprovalFlowStepGetDto>>(
      '/api/ApprovalFlowStep',
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Onay akış adımı oluşturulamadı');
  },

  update: async (
    id: number,
    data: ApprovalFlowStepUpdateDto
  ): Promise<ApprovalFlowStepGetDto> => {
    const response = await api.put<ApiResponse<ApprovalFlowStepGetDto>>(
      `/api/ApprovalFlowStep/${id}`,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Onay akış adımı güncellenemedi');
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(`/api/ApprovalFlowStep/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Onay akış adımı silinemedi');
    }
  },
};
