import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionDefinitionApi } from '../api/permissionDefinitionApi';
import type { CreatePermissionDefinitionDto } from '../types/access-control.types';

export const useCreatePermissionDefinitionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePermissionDefinitionDto) =>
      permissionDefinitionApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'definitions'] });
    },
  });
};
