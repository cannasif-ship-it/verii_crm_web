import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { userApi } from '../api/user-api';
import { queryKeys } from '../utils/query-keys';
import type { CreateUserDto } from '../types/user-types';

export const useCreateUser = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      toast.success(t('userManagement.messages.createSuccess', 'Kullanıcı başarıyla oluşturuldu'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('userManagement.messages.createError', 'Kullanıcı oluşturulamadı'));
    },
  });
};
