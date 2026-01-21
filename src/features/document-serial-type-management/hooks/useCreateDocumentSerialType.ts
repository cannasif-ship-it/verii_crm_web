import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentSerialTypeApi } from '../api/document-serial-type-api';
import { DOCUMENT_SERIAL_TYPE_QUERY_KEYS } from '../utils/query-keys';
import type { CreateDocumentSerialTypeDto } from '../types/document-serial-type-types';

export const useCreateDocumentSerialType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentSerialTypeDto) => documentSerialTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_SERIAL_TYPE_QUERY_KEYS.LIST] });
    },
  });
};
