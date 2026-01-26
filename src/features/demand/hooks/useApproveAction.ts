import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';
import type { ApproveActionDto } from '../types/demand-types';

export const useApproveAction = (): UseMutationResult<ApiResponse<boolean>, Error, ApproveActionDto, unknown> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ApproveActionDto) => demandApi.approve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.waitingApprovals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.demands() });
      toast.success(t('demand.approval.approveSuccess', 'Onay işlemi başarıyla gerçekleştirildi'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('demand.approval.approveError', 'Onay işlemi gerçekleştirilemedi'));
    },
  });
};
