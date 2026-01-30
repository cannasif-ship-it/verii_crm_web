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
    // --- YENİ AYARLAR ---
    refetchInterval: 60000,      // 60 saniyede bir kontrol et
    staleTime: 60000,            // 1 dakika boyunca veriyi taze say
    retry: 1,
    refetchOnWindowFocus: false, // Sayfaya tıklayınca tekrar yükleme yapma (Dönmeyi engeller)
    refetchOnMount: false,
    
    // Yükleniyor ikonunu engelleyen sihirli satır:
    placeholderData: (previousData) => previousData,
  });
}