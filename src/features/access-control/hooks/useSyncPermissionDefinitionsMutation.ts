import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionDefinitionApi } from '../api/permissionDefinitionApi';
import type { SyncPermissionDefinitionsDto } from '../types/access-control.types';

export const useSyncPermissionDefinitionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SyncPermissionDefinitionsDto) =>
      permissionDefinitionApi.sync(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'definitions'] });
    },
  });
};
