import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentSerialTypeApi } from '../api/document-serial-type-api';
import { DOCUMENT_SERIAL_TYPE_QUERY_KEYS } from '../utils/query-keys';

export const useDeleteDocumentSerialType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentSerialTypeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_SERIAL_TYPE_QUERY_KEYS.LIST] });
    },
  });
};
