import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { authAccessApi } from '../api/authAccessApi';
import { ACCESS_CONTROL_QUERY_KEYS } from '../utils/query-keys';

const STALE_TIME_MS = 60_000;

export const useMyPermissionsQuery = () => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ACCESS_CONTROL_QUERY_KEYS.ME_PERMISSIONS(userId),
    queryFn: () => authAccessApi.getMyPermissions(),
    enabled: !!token,
    staleTime: STALE_TIME_MS,
  });
};
