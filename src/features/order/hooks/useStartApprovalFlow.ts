import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';

export const useStartApprovalFlow = (): UseMutationResult<ApiResponse<boolean>, Error, { entityId: number; documentType: number; totalAmount: number }, unknown> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: { entityId: number; documentType: number; totalAmount: number }) => 
      orderApi.startApprovalFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.waitingApprovals() });
      toast.success(t('order.approval.startSuccess', 'Onay akışı başarıyla başlatıldı'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('order.approval.startError', 'Onay akışı başlatılamadı'));
    },
  });
};
