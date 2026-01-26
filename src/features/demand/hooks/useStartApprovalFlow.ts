import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { demandApi } from '../api/demand-api';
import { queryKeys } from '../utils/query-keys';

export const useStartApprovalFlow = (): UseMutationResult<ApiResponse<boolean>, Error, { entityId: number; documentType: number; totalAmount: number }, unknown> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: { entityId: number; documentType: number; totalAmount: number }) => 
      demandApi.startApprovalFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demands() });
      queryClient.invalidateQueries({ queryKey: queryKeys.waitingApprovals() });
      toast.success(t('demand.approval.startSuccess', 'Onay akışı başarıyla başlatıldı'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('demand.approval.startError', 'Onay akışı başlatılamadı'));
    },
  });
};
