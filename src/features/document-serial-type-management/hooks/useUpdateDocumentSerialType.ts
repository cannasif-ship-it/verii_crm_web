import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentSerialTypeApi } from '../api/document-serial-type-api';
import { DOCUMENT_SERIAL_TYPE_QUERY_KEYS } from '../utils/query-keys';
import type { UpdateDocumentSerialTypeDto } from '../types/document-serial-type-types';

export const useUpdateDocumentSerialType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDocumentSerialTypeDto }) =>
      documentSerialTypeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_SERIAL_TYPE_QUERY_KEYS.LIST] });
    },
  });
};
