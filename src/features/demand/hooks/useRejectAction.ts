import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { RejectActionDto } from '../types/demand-types';

export const useRejectAction = (): UseMutationResult<ApiResponse<boolean>, Error, RejectActionDto, unknown> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: RejectActionDto) => demandApi.reject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.waitingApprovals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.demands() });
      toast.success(t('demand.approval.rejectSuccess', 'Red işlemi başarıyla gerçekleştirildi'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('demand.approval.rejectError', 'Red işlemi gerçekleştirilemedi'));
    },
  });
};
