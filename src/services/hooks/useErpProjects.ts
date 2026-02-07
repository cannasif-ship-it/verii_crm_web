import { useQuery } from '@tanstack/react-query';
import { erpCommonApi } from '../erp-common-api';
import type { ErpProject } from '../erp-types';

export const useErpProjects = () => {
  return useQuery<ErpProject[]>({
    queryKey: ['erpProjects'],
    queryFn: () => erpCommonApi.getProjects(),
    staleTime: 5 * 60 * 1000,
  });
};
