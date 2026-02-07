import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { notificationApi } from '../api/notification-api';

export function useUnreadCount(): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['notification', 'unread-count'],
    queryFn: async (): Promise<number> => {
      try {
        return await notificationApi.getUnreadCount();
      } catch {
        return 0;
      }
    },
    refetchInterval: 60000,
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}
