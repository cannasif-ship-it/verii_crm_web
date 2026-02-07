import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionDefinitionApi } from '../api/permissionDefinitionApi';
import type { UpdatePermissionDefinitionDto } from '../types/access-control.types';

export const useUpdatePermissionDefinitionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePermissionDefinitionDto }) =>
      permissionDefinitionApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'definitions'] });
    },
  });
};
