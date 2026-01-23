import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';
import { quotationApi } from '../api/quotation-api';
import { queryKeys } from '../utils/query-keys';

export const useStartApprovalFlow = (): UseMutationResult<ApiResponse<boolean>, Error, { entityId: number; documentType: number; totalAmount: number }, unknown> => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: { entityId: number; documentType: number; totalAmount: number }) => 
      quotationApi.startApprovalFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.waitingApprovals() });
      toast.success(t('quotation.approval.startSuccess', 'Onay akışı başarıyla başlatıldı'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('quotation.approval.startError', 'Onay akışı başlatılamadı'));
    },
  });
};
