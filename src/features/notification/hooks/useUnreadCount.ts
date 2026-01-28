import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../api/notification-api';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notification', 'unread-count'],
    queryFn: async (): Promise<number> => {
      try {
        return await notificationApi.getUnreadCount();
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return 0;
      }
    },
    refetchInterval: 30000,
    staleTime: 30000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
