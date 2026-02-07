import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionGroupApi } from '../api/permissionGroupApi';

export const useDeletePermissionGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionGroupApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'groups'] });
    },
  });
};
