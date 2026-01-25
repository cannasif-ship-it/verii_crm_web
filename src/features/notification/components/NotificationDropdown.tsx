import { type ReactElement, useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '../stores/notification-store';
import { notificationApi } from '../api/notification-api';
import { NotificationItem } from './NotificationItem';
import { debounce } from '@/lib/utils/debounce';

interface NotificationDropdownProps {
  children: ReactElement;
}

export function NotificationDropdown({ children }: NotificationDropdownProps): ReactElement {
  const { t, i18n } = useTranslation();
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasNextPage,
    currentPage,
    setLoading,
    setLoadingMore,
    setNotifications,
    appendNotifications,
    setPaginationState,
    markAllAsRead: markAllAsReadStore,
    setUnreadCount,
    clearNotifications,
  } = useNotificationStore();

  // --- MANTIK KISMI (Logic - Aynen Korundu) ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const currentLanguageRef = useRef(i18n.language);
  const [isOpen, setIsOpen] = useState(false);

  const loadInitialNotifications = useCallback(async (): Promise<void> => {
    if (notifications.length > 0 && currentPage > 0) return;
    setLoading(true);
    try {
      const response = await notificationApi.getPagedNotifications({
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'Id',
        sortDirection: 'desc',
      });
      setNotifications(response.data);
      setPaginationState(1, response.totalPages, response.hasNextPage);
      setUnreadCount(response.totalCount);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [notifications.length, currentPage, setLoading, setNotifications, setPaginationState, setUnreadCount]);

  const loadMoreNotifications = useCallback(async (): Promise<void> => {
    if (!hasNextPage || isLoadingMore || isLoading) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await notificationApi.getPagedNotifications({
        pageNumber: nextPage,
        pageSize: 10,
        sortBy: 'Id',
        sortDirection: 'desc',
      });
      appendNotifications(response.data);
      setPaginationState(nextPage, response.totalPages, response.hasNextPage);
    } catch (error) {
    } finally {
      setLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, setLoadingMore, appendNotifications, setPaginationState]);

  const handleScroll = useCallback((): void => {
    if (!scrollContainerRef.current || isLoadingMore || isLoading) return;
    const container = scrollContainerRef.current;
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 200 && hasNextPage) {
      loadMoreNotifications();
    }
  }, [isLoadingMore, isLoading, hasNextPage, loadMoreNotifications]);

  const debouncedScrollHandlerRef = useRef<((...args: unknown[]) => void) | undefined>(undefined);
  
  useEffect(() => {
    debouncedScrollHandlerRef.current = debounce(handleScroll, 300);
    return () => { debouncedScrollHandlerRef.current = undefined; };
  }, [handleScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;
    const handler = debouncedScrollHandlerRef.current;
    if (handler) {
        container.addEventListener('scroll', handler);
        return () => container.removeEventListener('scroll', handler);
    }
  }, [isOpen]);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = scrollContainerRef.current;
    if (!trigger || !hasNextPage || !container || !isOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore && !isLoading) {
          loadMoreNotifications();
        }
      },
      { root: container, rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, isLoading, loadMoreNotifications, isOpen]);

  useEffect(() => {
    if (isOpen && notifications.length === 0 && !isLoading) loadInitialNotifications();
  }, [isOpen, notifications.length, isLoading, loadInitialNotifications]);

  useEffect(() => {
    if (currentLanguageRef.current !== i18n.language) {
      currentLanguageRef.current = i18n.language;
      clearNotifications();
      if (isOpen) loadInitialNotifications();
    }
  }, [i18n.language, isOpen, loadInitialNotifications, clearNotifications]);

  const handleMarkAllAsRead = async (): Promise<void> => {
    if (unreadCount === 0) return;
    try {
      await notificationApi.markAllAsRead();
      markAllAsReadStore();
    } catch (error) { }
  };

  // --- TASARIM KISMI (JSX Update) ---
  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      
      {/* Container Style: Topbar'daki koyu mor, border ve shadow */}
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-[#1a1025] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-200" 
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{t('notification.title')}</span>
                {unreadCount > 0 && (
                     <span className="text-[10px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/20">
                        {unreadCount}
                     </span>
                )}
            </div>
             <button 
                onClick={() => setIsOpen(false)} 
                className="text-xs text-slate-400 hover:text-white transition-colors"
            >
                {t('notification.close')}
            </button>
        </div>

        {/* Scrollable List */}
        <div
          ref={scrollContainerRef}
          className="max-h-64 overflow-y-auto custom-scrollbar"
        >
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {t('notification.loading')}...
            </div>
          ) : (
            <div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    {t('notification.noNotifications')}
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                  
                  {/* Infinite Scroll Loaders */}
                  {hasNextPage && <div ref={loadMoreTriggerRef} className="h-4" />}
                  {isLoadingMore && (
                    <div className="p-2 text-center text-xs text-slate-500">
                      {t('notification.loading')}...
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-[#1a1025]">
             <button 
                onClick={handleMarkAllAsRead} 
                className="hover:text-white transition-colors disabled:opacity-50"
                disabled={unreadCount === 0}
            >
                {t('notification.markAllAsRead')}
            </button>
             {/* Buraya "Destek Talepleri" gibi ekstra linkler eklenebilir */}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}