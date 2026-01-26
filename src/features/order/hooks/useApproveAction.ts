import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { orderApi } from '../api/order-api';
import { queryKeys } from '../utils/query-keys';
import type { ApproveActionDto } from '../types/order-types';

export const useApproveAction = (): UseMutationResult<ApiResponse<boolean>, Error, ApproveActionDto, unknown> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ApproveActionDto) => orderApi.approve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.waitingApprovals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
      toast.success(t('order.approval.approveSuccess', 'Onay işlemi başarıyla gerçekleştirildi'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('order.approval.approveError', 'Onay işlemi gerçekleştirilemedi'));
    },
  });
};
